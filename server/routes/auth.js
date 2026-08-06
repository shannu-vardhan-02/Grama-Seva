import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { body, validationResult } from "express-validator";
import rateLimit from "express-rate-limit";
import User from "../models/User.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const isDev = process.env.NODE_ENV !== "production";

// ─── Rate Limiters ────────────────────────────────────────────────────────────
// Strict limiter for login — max 10 attempts per 15 min per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts. Please try again in 15 minutes." },
  skipSuccessfulRequests: true, // Only count failed attempts
});

// Registration limiter — max 5 accounts per IP per hour
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many accounts created from this IP. Try again in 1 hour." },
});

// Google auth limiter
const googleLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many Google sign-in attempts. Try again later." },
});

// ─── Validation Rules ─────────────────────────────────────────────────────────
const registerValidation = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required")
    .isLength({ max: 100 }).withMessage("Name must be under 100 characters"),
  body("email")
    .trim()
    .isEmail().withMessage("Valid email is required")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
    .matches(/[0-9]/).withMessage("Password must contain at least one number"),
  body("role")
    .optional()
    .isIn(["Customer", "Worker"]).withMessage("Role must be Customer or Worker"),
  body("phone")
    .optional()
    .trim()
    .isLength({ max: 20 }).withMessage("Phone number too long"),
];

const loginValidation = [
  body("email")
    .trim()
    .isEmail().withMessage("Valid email is required")
    .normalizeEmail(),
  body("password")
    .notEmpty().withMessage("Password is required"),
];

// Helper to handle validation errors
const handleValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  return null;
};

// ─── Routes ───────────────────────────────────────────────────────────────────

// POST /api/auth/register
router.post("/register", registerLimiter, registerValidation, async (req, res) => {
  const validationError = handleValidation(req, res);
  if (validationError) return;

  try {
    const { name, email, password, role, phone, workerProfile } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 12); // 12 rounds is safer than 10

    const userData = {
      name,
      email,
      passwordHash,
      role: role || "Customer",
      phone: phone || "",
      authProvider: "local",
    };

    if (userData.role === "Worker" && workerProfile) {
      userData.workerProfile = { ...workerProfile, isVerified: false };
    }

    const user = await User.create(userData);
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({ token, user });
  } catch (error) {
    console.error("[register]", error);
    res.status(500).json({ message: isDev ? error.message : "Registration failed" });
  }
});

// POST /api/auth/login
router.post("/login", loginLimiter, loginValidation, async (req, res) => {
  const validationError = handleValidation(req, res);
  if (validationError) return;

  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    // Use a constant-time comparison regardless of whether user exists
    const dummyHash = "$2b$12$invalidhashfortimingattackprotection000000000000000000";
    const isMatch = user
      ? await bcrypt.compare(password, user.passwordHash)
      : await bcrypt.compare(password, dummyHash).then(() => false);

    // Generic error message — never reveal if email exists or not
    if (!user || user.authProvider !== "local" || !isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({ token, user });
  } catch (error) {
    console.error("[login]", error);
    res.status(500).json({ message: isDev ? error.message : "Login failed" });
  }
});

// POST /api/auth/google
router.post("/google", googleLimiter, async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential || typeof credential !== "string") {
      return res.status(400).json({ message: "Invalid Google credential" });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (!user) {
      user = await User.create({
        name,
        email,
        googleId,
        role: "Customer",
        authProvider: "google",
      });
    } else if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({ token, user });
  } catch (error) {
    console.error("[google-auth]", error);
    res.status(401).json({ message: "Google authentication failed" });
  }
});

// GET /api/auth/me — returns the current authenticated user
router.get("/me", verifyToken, (req, res) => {
  res.json(req.user);
});

// NOTE: The /create-admin endpoint has been removed.
// Admin accounts are created automatically on first server start via db.js seeding.
// Use the ADMIN_SEED_PASSWORD environment variable to set the admin password securely.

export default router;
