import express from "express";
import bcrypt from "bcrypt";
import { body, param, validationResult } from "express-validator";
import User from "../models/User.js";
import { verifyToken, requireRole } from "../middleware/auth.js";
import { createNotification } from "../utils/notify.js";

const router = express.Router();
router.use(verifyToken);

const isDev = process.env.NODE_ENV !== "production";

// Helper
const handleValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  return null;
};

// GET /api/users — Admin gets all users; others get verified workers
router.get("/", async (req, res) => {
  try {
    if (req.user.role === "Admin") {
      const users = await User.find().select("-passwordHash");
      return res.json(users);
    }
    const workers = await User.find({
      role: "Worker",
      "workerProfile.isVerified": true,
    }).select("-passwordHash");
    return res.json(workers);
  } catch (error) {
    console.error("[GET /users]", error);
    res.status(500).json({ message: isDev ? error.message : "Failed to fetch users" });
  }
});

// POST /api/users — Admin creates a user
router.post(
  "/",
  requireRole("Admin"),
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").trim().isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("password")
      .isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
    body("role")
      .isIn(["Customer", "Worker", "Admin"]).withMessage("Invalid role"),
  ],
  async (req, res) => {
    const err = handleValidation(req, res);
    if (err) return;

    try {
      const { name, email, password, role, phone, workerProfile } = req.body;
      const passwordHash = await bcrypt.hash(password, 12);

      const userData = { name, email, passwordHash, role, phone: phone || "", authProvider: "local" };
      if (role === "Worker" && workerProfile) {
        userData.workerProfile = workerProfile;
      }

      const user = await User.create(userData);
      res.status(201).json(user);
    } catch (error) {
      console.error("[POST /users]", error);
      // Handle duplicate email gracefully
      if (error.code === 11000) {
        return res.status(400).json({ message: "Email already in use" });
      }
      res.status(500).json({ message: isDev ? error.message : "Failed to create user" });
    }
  }
);

// GET /api/users/:id
router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid user ID")],
  async (req, res) => {
    const err = handleValidation(req, res);
    if (err) return;

    try {
      const user = await User.findById(req.params.id).select("-passwordHash");
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user);
    } catch (error) {
      console.error("[GET /users/:id]", error);
      res.status(500).json({ message: isDev ? error.message : "Failed to fetch user" });
    }
  }
);

// POST /api/users/:id/reviews — Customer posts a review
router.post(
  "/:id/reviews",
  [
    param("id").isMongoId().withMessage("Invalid user ID"),
    body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
    body("comment").optional().trim().isLength({ max: 500 }).withMessage("Comment must be under 500 characters"),
  ],
  async (req, res) => {
    const err = handleValidation(req, res);
    if (err) return;

    try {
      if (req.user.role !== "Customer") {
        return res.status(403).json({ message: "Only customers can post reviews" });
      }

      const { rating, comment } = req.body;
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ message: "User not found" });

      if (!user.workerProfile) user.workerProfile = {};
      if (!user.workerProfile.reviews) user.workerProfile.reviews = [];

      const newReview = {
        customerName: req.user.name,
        rating: Number(rating),
        comment: comment || "",
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      };

      user.workerProfile.reviews.push(newReview);

      const totalRating = user.workerProfile.reviews.reduce((sum, r) => sum + Number(r.rating), 0);
      user.workerProfile.averageRating = totalRating / user.workerProfile.reviews.length;
      user.workerProfile.reviewCount = user.workerProfile.reviews.length;

      await user.save();
      res.json(user);
    } catch (error) {
      console.error("[POST /users/:id/reviews]", error);
      res.status(500).json({ message: isDev ? error.message : "Failed to submit review" });
    }
  }
);

// PATCH /api/users/:id/verify — Admin verifies a worker
router.patch(
  "/:id/verify",
  requireRole("Admin"),
  [
    param("id").isMongoId().withMessage("Invalid user ID"),
    body("status").isIn(["Approved", "Rejected"]).withMessage("Status must be Approved or Rejected"),
  ],
  async (req, res) => {
    const err = handleValidation(req, res);
    if (err) return;

    try {
      const { status } = req.body;
      const user = await User.findById(req.params.id);

      if (!user || user.role !== "Worker") {
        return res.status(404).json({ message: "Worker not found" });
      }

      user.workerProfile.isVerified = status === "Approved";
      if (user.workerProfile.proofOfWork?.length > 0) {
        user.workerProfile.proofOfWork.forEach((pow) => { pow.status = status; });
      }

      await user.save();

      const io = req.app.get("io");
      if (io) io.to("role:Admin").emit("users:updated", user);

      await createNotification(io, {
        recipient: user._id,
        title: "Profile Verification",
        message: `Your worker profile has been ${status.toLowerCase()}.`,
      });

      res.json(user);
    } catch (error) {
      console.error("[PATCH /users/:id/verify]", error);
      res.status(500).json({ message: isDev ? error.message : "Failed to verify worker" });
    }
  }
);

// DELETE /api/users/:id — Admin deletes a user
router.delete(
  "/:id",
  requireRole("Admin"),
  [param("id").isMongoId().withMessage("Invalid user ID")],
  async (req, res) => {
    const err = handleValidation(req, res);
    if (err) return;

    try {
      if (req.params.id === req.user._id.toString()) {
        return res.status(400).json({ message: "You cannot delete your own admin account" });
      }
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("[DELETE /users/:id]", error);
      res.status(500).json({ message: isDev ? error.message : "Failed to delete user" });
    }
  }
);

// PATCH /api/users/:id/profile — User updates their own profile (or Admin can update any)
router.patch(
  "/:id/profile",
  [
    param("id").isMongoId().withMessage("Invalid user ID"),
    body("name").optional().trim().notEmpty().withMessage("Name cannot be empty")
      .isLength({ max: 100 }).withMessage("Name too long"),
    body("phone").optional().trim().isLength({ max: 20 }).withMessage("Phone number too long"),
  ],
  async (req, res) => {
    const err = handleValidation(req, res);
    if (err) return;

    try {
      if (req.params.id !== req.user._id.toString() && req.user.role !== "Admin") {
        return res.status(403).json({ message: "Forbidden" });
      }

      const { name, phone, workerProfile } = req.body;
      const updateData = {};

      if (name !== undefined) updateData.name = name;
      if (phone !== undefined) updateData.phone = phone;

      if (workerProfile) {
        // Only allow safe workerProfile keys to be updated
        const allowedWorkerKeys = ["skill", "experience", "bio", "address", "location", "serviceRadius", "isAvailable", "services", "gallery", "skills"];
        for (const key of allowedWorkerKeys) {
          if (workerProfile[key] !== undefined) {
            updateData[`workerProfile.${key}`] = workerProfile[key];
          }
        }
      }

      const user = await User.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        { returnDocument: 'after', runValidators: true }
      ).select("-passwordHash");

      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user);
    } catch (error) {
      console.error("[PATCH /users/:id/profile]", error);
      res.status(500).json({ message: isDev ? error.message : "Failed to update profile" });
    }
  }
);

// DELETE /api/users/:workerId/reviews/:reviewIndex — Remove review from worker profile
router.delete("/:workerId/reviews/:reviewIndex", async (req, res) => {
  try {
    const user = await User.findById(req.params.workerId);
    if (!user || !user.workerProfile) {
      return res.status(404).json({ message: "Worker not found" });
    }

    const idx = parseInt(req.params.reviewIndex, 10);
    if (isNaN(idx) || idx < 0 || !user.workerProfile.reviews || idx >= user.workerProfile.reviews.length) {
      return res.status(400).json({ message: "Invalid review index" });
    }

    user.workerProfile.reviews.splice(idx, 1);

    // Recalculate rating
    const reviews = user.workerProfile.reviews;
    const total = reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0);
    user.workerProfile.averageRating = reviews.length > 0 ? total / reviews.length : 0;
    user.workerProfile.reviewCount = reviews.length;

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
