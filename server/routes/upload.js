import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const router = express.Router();

// Ensure local uploads directory exists
const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Check if Cloudinary credentials are provided
const hasCloudinary =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET &&
  process.env.CLOUDINARY_CLOUD_NAME.trim() !== "" &&
  process.env.CLOUDINARY_CLOUD_NAME !== "your-cloud-name";

let proofStorage;
let galleryStorage;

if (hasCloudinary) {
  console.log("📁 Image Upload: Using Cloudinary Storage");
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME.trim(),
    api_key: process.env.CLOUDINARY_API_KEY.trim(),
    api_secret: process.env.CLOUDINARY_API_SECRET.trim(),
  });

  proofStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "grama-seva/proof-of-work",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [{ width: 1200, height: 900, crop: "limit", quality: "auto" }],
    },
  });

  galleryStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "grama-seva/gallery",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [{ width: 1200, height: 900, crop: "limit", quality: "auto" }],
    },
  });
} else {
  console.log("📁 Image Upload: Cloudinary keys not found in .env, falling back to local server/uploads/");
  const localStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname) || ".jpg";
      cb(null, file.fieldname + "-" + uniqueSuffix + ext);
    },
  });
  proofStorage = localStorage;
  galleryStorage = localStorage;
}

const fileFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (JPG, PNG, WEBP) are allowed"), false);
  }
};

const uploadProof = multer({
  storage: proofStorage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

const uploadGallery = multer({
  storage: galleryStorage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Helper function to build final file URL
const getFileUrl = (req, file) => {
  if (hasCloudinary && file.path && file.path.startsWith("http")) {
    return file.path;
  }
  // Local fallback URL
  const protocol = req.protocol || "http";
  const host = req.get("host") || "localhost:3000";
  return `${protocol}://${host}/uploads/${file.filename}`;
};

// POST /api/upload/proof — accepts field "image" or "images"
router.post("/proof", uploadProof.any(), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No image file provided" });
    }
    const urls = req.files.map((f) => getFileUrl(req, f));
    // If single image requested, return url & urls
    res.json({
      url: urls[0],
      urls: urls,
    });
  } catch (err) {
    console.error("Upload proof error:", err);
    res.status(500).json({ error: err.message || "Upload failed" });
  }
});

// POST /api/upload/gallery — accepts field "image" or "images"
router.post("/gallery", uploadGallery.any(), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No image file provided" });
    }
    const urls = req.files.map((f) => getFileUrl(req, f));
    res.json({
      url: urls[0],
      urls: urls,
    });
  } catch (err) {
    console.error("Upload gallery error:", err);
    res.status(500).json({ error: err.message || "Upload failed" });
  }
});

// Error handling middleware for multer
router.use((err, req, res, next) => {
  console.error("Multer/Upload Error:", err);
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ error: "File too large. Maximum size is 10MB." });
  }
  res.status(400).json({ error: err.message || "Upload failed" });
});

export default router;
