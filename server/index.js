import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { connectDB } from "./db.js";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import bookingRoutes from "./routes/bookings.js";
import reviewRoutes from "./routes/reviews.js";
import notificationRoutes from "./routes/notifications.js";
import uploadRoutes from "./routes/upload.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const isDev = process.env.NODE_ENV !== "production";

// ─── Allowed Origins ────────────────────────────────────────────────────────
// In development: allow localhost variants
// In production: allow only the explicitly whitelisted CLIENT_URL(s)
const productionOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const devOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:4173",
];

const allowedOrigins = isDev
  ? [...devOrigins, ...productionOrigins]
  : productionOrigins;

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman in dev)
    if (!origin) {
      return isDev
        ? callback(null, true)
        : callback(new Error("No origin — blocked in production"));
    }

    const isAllowed =
      allowedOrigins.includes(origin) ||
      // Allow any *.vercel.app subdomain (preview deployments)
      /^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin);

    if (isAllowed) {
      return callback(null, true);
    }
    return callback(new Error(`CORS: Origin "${origin}" is not allowed`));
  },
  credentials: true,
};

// ─── Security Middleware ─────────────────────────────────────────────────────
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use("/uploads", express.static("uploads"));

// ─── Global rate limiter (all routes) ───────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});
app.use(globalLimiter);

// ─── Database ────────────────────────────────────────────────────────────────
connectDB();

// ─── HTTP + Socket.IO Server ─────────────────────────────────────────────────
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    // Socket.IO uses the same origin policy as REST
    origin: (origin, callback) => {
      if (!origin) return isDev ? callback(null, true) : callback(new Error("Blocked"));
      const isAllowed =
        allowedOrigins.includes(origin) ||
        /^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin);
      return isAllowed ? callback(null, true) : callback(new Error("Socket CORS blocked"));
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.set("io", io);

// ─── Socket.IO Authentication ─────────────────────────────────────────────
io.on("connection", (socket) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) return; // unauthenticated — read-only connection

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.join(`user:${decoded.userId}`);

    // Role room: we trust the role from the JWT, NOT from the client
    if (decoded.role) {
      socket.join(`role:${decoded.role}`);
    }
  } catch (err) {
    // Invalid token — disconnect the socket
    if (isDev) console.error("Socket auth error:", err.message);
    socket.disconnect(true);
  }

  socket.on("disconnect", () => {
    // Cleanup is automatic
  });
});

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/upload", uploadRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ status: "running", message: "Grama Seva API" });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ─── Global Error Handler ────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // Always log the full error on the server
  console.error(`[ERROR] ${req.method} ${req.path}:`, err);

  // Never expose internal error details to the client in production
  const status = err.status || 500;
  const message = isDev ? err.message : "Internal server error";
  res.status(status).json({ message });
});

// ─── Start ───────────────────────────────────────────────────────────────────
server.listen(port, () => {
  console.log(`[${isDev ? "DEV" : "PROD"}] Server running on port ${port}`);
});

export { io };
