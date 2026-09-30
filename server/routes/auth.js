import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { body, validationResult } from "express-validator";
import rateLimit from "express-rate-limit";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import User from "../models/User.js";
import Passkey from "../models/Passkey.js";
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

// Passkey limiter — covers both registration and authentication ceremonies
const passkeyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many passkey requests. Please try again later." },
});

// ─── WebAuthn / Passkey Configuration ────────────────────────────────────────
// rpID must match the hostname of the page that calls navigator.credentials.*
// Change to your real domain (no port) when deploying to production.
const RP_NAME   = "Grama Seva";
const RP_ID     = "localhost";
const RP_ORIGIN = "http://localhost:5173"; // change to https://yourdomain.com in prod

// ─── In-memory Challenge Store ────────────────────────────────────────────────
// Challenges are short-lived (5 min) and one-time-use.
// For production with multiple processes, replace this Map with a Redis/DB store.
const challengeStore = new Map();
const CHALLENGE_TTL  = 5 * 60 * 1000; // 5 minutes

const setChallenge = (key, challenge) => {
  challengeStore.set(key, { challenge, expiresAt: Date.now() + CHALLENGE_TTL });
};

const getChallenge = (key) => {
  const entry = challengeStore.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    challengeStore.delete(key);
    return null;
  }
  // One-time use — delete immediately to prevent replay
  challengeStore.delete(key);
  return entry.challenge;
};

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

// ─── Passkey (WebAuthn) Routes ────────────────────────────────────────────────

// POST /api/auth/passkey/register/options
// Step 1 of registration ceremony — generate challenge options for the browser.
// Requires the user to already be authenticated (they're adding a passkey in Settings
// or at the end of sign-up).
router.post("/passkey/register/options", verifyToken, passkeyLimiter, async (req, res) => {
  try {
    const user = req.user;
    const existingPasskeys = await Passkey.find({ userId: user._id });

    const options = await generateRegistrationOptions({
      rpName:           RP_NAME,
      rpID:             RP_ID,
      userID:           Buffer.from(user._id.toString()),
      userName:         user.email,
      userDisplayName:  user.name,
      attestationType:  "none", // "none" = no attestation statement needed (privacy-friendly)
      excludeCredentials: existingPasskeys.map((pk) => ({
        id:         pk.credentialID,
        type:       "public-key",
        transports: pk.transports,
      })),
      authenticatorSelection: {
        residentKey:      "required",  // store credential on device (enables discoverable login)
        userVerification: "required",  // always require biometric / PIN
      },
    });

    // Store challenge keyed to this user's registration session
    setChallenge(`reg:${user._id}`, options.challenge);
    res.json(options);
  } catch (error) {
    console.error("[passkey-register-options]", error);
    res.status(500).json({ message: isDev ? error.message : "Failed to generate passkey options" });
  }
});

// POST /api/auth/passkey/register/verify
// Step 2 — verify the authenticator response and persist the new credential.
router.post("/passkey/register/verify", verifyToken, passkeyLimiter, async (req, res) => {
  try {
    const user = req.user;
    const expectedChallenge = getChallenge(`reg:${user._id}`);
    if (!expectedChallenge) {
      return res.status(400).json({ message: "Registration challenge expired. Please try again." });
    }

    const { verified, registrationInfo } = await verifyRegistrationResponse({
      response:          req.body,
      expectedChallenge,
      expectedOrigin:    RP_ORIGIN,
      expectedRPID:      RP_ID,
    });

    if (!verified || !registrationInfo) {
      return res.status(400).json({ message: "Passkey verification failed" });
    }

    const { credential, credentialDeviceType, credentialBackedUp } = registrationInfo;

    const passkey = await Passkey.create({
      userId:              user._id,
      credentialID:        credential.id,
      credentialPublicKey: Buffer.from(credential.publicKey).toString("base64"),
      counter:             credential.counter,
      deviceType:          credentialDeviceType,
      backedUp:            credentialBackedUp,
      transports:          req.body.response?.transports ?? [],
      label:               req.body.label?.trim() || "My Passkey",
    });

    res.json({ verified: true, passkeyId: passkey._id });
  } catch (error) {
    console.error("[passkey-register-verify]", error);
    // Duplicate credential (already registered on this device)
    if (error.code === 11000) {
      return res.status(409).json({ message: "This passkey is already registered on your account." });
    }
    res.status(400).json({ message: isDev ? error.message : "Passkey registration failed" });
  }
});

// POST /api/auth/passkey/login/options
// Step 1 of authentication ceremony — generate challenge for the browser.
// Public route — no JWT needed. Optionally narrow credentials by email.
router.post("/passkey/login/options", passkeyLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    let allowCredentials = [];

    // If the user provides their email, pre-fill credential hints so the browser
    // can show only their registered passkeys instead of the full OS picker.
    if (email && typeof email === "string") {
      const user = await User.findOne({ email: email.trim().toLowerCase() });
      if (user) {
        const passkeys = await Passkey.find({ userId: user._id });
        allowCredentials = passkeys.map((pk) => ({
          id:         pk.credentialID,
          type:       "public-key",
          transports: pk.transports,
        }));
      }
    }

    const options = await generateAuthenticationOptions({
      rpID:             RP_ID,
      userVerification: "required",
      allowCredentials, // empty = discoverable (browser picks from all resident keys)
    });

    // Key by the challenge itself — supports discoverable credentials where userId is unknown
    setChallenge(`auth:${options.challenge}`, options.challenge);
    res.json(options);
  } catch (error) {
    console.error("[passkey-login-options]", error);
    res.status(500).json({ message: isDev ? error.message : "Failed to generate login challenge" });
  }
});

// POST /api/auth/passkey/login/verify
// Step 2 — verify the signed assertion, update counter, issue JWT.
router.post("/passkey/login/verify", passkeyLimiter, async (req, res) => {
  try {
    const { response, challengeId } = req.body;
    if (!response || !challengeId) {
      return res.status(400).json({ message: "Missing response or challengeId" });
    }

    const expectedChallenge = getChallenge(`auth:${challengeId}`);
    if (!expectedChallenge) {
      return res.status(400).json({ message: "Login challenge expired. Please try again." });
    }

    // Find the passkey by credential ID
    const passkey = await Passkey.findOne({ credentialID: response.id });
    if (!passkey) {
      return res.status(401).json({ message: "Passkey not recognized on this account." });
    }

    const { verified, authenticationInfo } = await verifyAuthenticationResponse({
      response,
      expectedChallenge,
      expectedOrigin:  RP_ORIGIN,
      expectedRPID:    RP_ID,
      credential: {
        id:         passkey.credentialID,
        publicKey:  Buffer.from(passkey.credentialPublicKey, "base64"),
        counter:    passkey.counter,
        transports: passkey.transports,
      },
    });

    if (!verified) {
      return res.status(401).json({ message: "Passkey authentication failed." });
    }

    // Update counter (monotonically increasing — prevents cloned authenticator replay)
    passkey.counter    = authenticationInfo.newCounter;
    passkey.lastUsedAt = new Date();
    await passkey.save();

    const user = await User.findById(passkey.userId);
    if (!user) return res.status(401).json({ message: "User account not found." });

    // Issue the same JWT format used by all other auth flows
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, user });
  } catch (error) {
    console.error("[passkey-login-verify]", error);
    res.status(401).json({ message: isDev ? error.message : "Passkey authentication failed." });
  }
});

// GET /api/auth/passkeys — list all passkeys for the authenticated user
router.get("/passkeys", verifyToken, async (req, res) => {
  try {
    const passkeys = await Passkey.find({ userId: req.user._id })
      .select("_id label deviceType backedUp transports lastUsedAt createdAt")
      .sort({ createdAt: -1 });
    res.json(passkeys);
  } catch (error) {
    console.error("[passkeys-list]", error);
    res.status(500).json({ message: "Failed to fetch passkeys" });
  }
});

// DELETE /api/auth/passkeys/:id — remove a specific passkey
router.delete("/passkeys/:id", verifyToken, async (req, res) => {
  try {
    const passkey = await Passkey.findOne({ _id: req.params.id, userId: req.user._id });
    if (!passkey) {
      return res.status(404).json({ message: "Passkey not found" });
    }
    await passkey.deleteOne();
    res.json({ message: "Passkey removed successfully" });
  } catch (error) {
    console.error("[passkeys-delete]", error);
    res.status(500).json({ message: "Failed to remove passkey" });
  }
});

export default router;
