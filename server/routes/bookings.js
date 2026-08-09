import express from "express";
import { body, param, validationResult } from "express-validator";
import Booking from "../models/Booking.js";
import User from "../models/User.js";
import { verifyToken } from "../middleware/auth.js";
import { createNotification } from "../utils/notify.js";
import { calculateDistance } from "../utils/distance.js";

const router = express.Router();
router.use(verifyToken);

const isDev = process.env.NODE_ENV !== "production";

// Valid service categories — single source of truth
const SERVICE_CATEGORIES = [
  "electrician", "mason", "plumber", "mechanic",
  "carpenter", "painter", "cleaning", "general", "other",
];

const handleValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  return null;
};

// POST /api/bookings — Customer creates a booking
router.post(
  "/",
  [
    body("serviceCategory")
      .isIn(SERVICE_CATEGORIES)
      .withMessage(`Service category must be one of: ${SERVICE_CATEGORIES.join(", ")}`),
    body("description")
      .trim()
      .notEmpty().withMessage("Description is required")
      .isLength({ max: 1000 }).withMessage("Description must be under 1000 characters"),
    body("coordinates")
      .isArray({ min: 2, max: 2 }).withMessage("Coordinates must be [longitude, latitude]")
      .custom((coords) => {
        const [lng, lat] = coords;
        if (typeof lng !== "number" || typeof lat !== "number") throw new Error("Coordinates must be numbers");
        if (lng < -180 || lng > 180) throw new Error("Longitude must be between -180 and 180");
        if (lat < -90 || lat > 90) throw new Error("Latitude must be between -90 and 90");
        return true;
      }),
    body("address")
      .trim()
      .notEmpty().withMessage("Address is required")
      .isLength({ max: 300 }).withMessage("Address must be under 300 characters"),
  ],
  async (req, res) => {
    const err = handleValidation(req, res);
    if (err) return;

    try {
      if (req.user.role !== "Customer") {
        return res.status(403).json({ message: "Only customers can create bookings" });
      }

      const { serviceCategory, description, coordinates, address } = req.body;

      const booking = await Booking.create({
        customer: req.user._id,
        customerName: req.user.name,
        serviceCategory,
        description,
        location: { type: "Point", coordinates },
        address,
      });

      const io = req.app.get("io");

      await createNotification(io, {
        recipient: req.user._id,
        booking: booking._id,
        title: "Booking Created",
        message: "Your service request has been created and is looking for workers.",
      });

      const workers = await User.find({
        role: "Worker",
        "workerProfile.isVerified": true,
        "workerProfile.isAvailable": true,
        "workerProfile.skill": serviceCategory,
      });

      const [reqLng, reqLat] = coordinates;

      for (const worker of workers) {
        if (worker.workerProfile?.location?.coordinates) {
          const [wLng, wLat] = worker.workerProfile.location.coordinates;
          const distance = calculateDistance(reqLat, reqLng, wLat, wLng);
          if (distance <= worker.workerProfile.serviceRadius) {
            await createNotification(io, {
              recipient: worker._id,
              booking: booking._id,
              title: "New Service Request",
              message: `New ${serviceCategory} request nearby.`,
            });
            if (io) io.to(`user:${worker._id}`).emit("booking:new", booking);
          }
        }
      }

      res.status(201).json(booking);
    } catch (error) {
      console.error("[POST /bookings]", error);
      res.status(500).json({ message: isDev ? error.message : "Failed to create booking" });
    }
  }
);

// GET /api/bookings — Role-based booking listing
router.get("/", async (req, res) => {
  try {
    let bookings;

    if (req.user.role === "Admin") {
      bookings = await Booking.find().sort({ createdAt: -1 }).limit(500);
    } else if (req.user.role === "Customer") {
      bookings = await Booking.find({ customer: req.user._id }).sort({ createdAt: -1 });
    } else if (req.user.role === "Worker") {
      const myBookings = await Booking.find({ worker: req.user._id }).sort({ createdAt: -1 });

      const requestedBookings = await Booking.find({
        status: "Requested",
        worker: null,
        serviceCategory: req.user.workerProfile?.skill,
      }).sort({ createdAt: -1 });

      const wCoords = req.user.workerProfile?.location?.coordinates;
      let validRequestedBookings = [];

      if (wCoords) {
        const [wLng, wLat] = wCoords;
        validRequestedBookings = requestedBookings.filter((b) => {
          if (!b.location?.coordinates) return false;
          const [bLng, bLat] = b.location.coordinates;
          return calculateDistance(wLat, wLng, bLat, bLng) <= req.user.workerProfile.serviceRadius;
        });
      }

      // Merge and deduplicate
      const allBookings = [...myBookings, ...validRequestedBookings].sort((a, b) => b.createdAt - a.createdAt);
      const map = new Map();
      bookings = allBookings.filter((item) => {
        if (map.has(item._id.toString())) return false;
        map.set(item._id.toString(), true);
        return true;
      });
    }

    res.json(bookings);
  } catch (error) {
    console.error("[GET /bookings]", error);
    res.status(500).json({ message: isDev ? error.message : "Failed to fetch bookings" });
  }
});

// PATCH /api/bookings/:id/accept
router.patch(
  "/:id/accept",
  [param("id").isMongoId().withMessage("Invalid booking ID")],
  async (req, res) => {
    const err = handleValidation(req, res);
    if (err) return;

    try {
      if (req.user.role !== "Worker") {
        return res.status(403).json({ message: "Only workers can accept bookings" });
      }

      const booking = await Booking.findById(req.params.id);
      if (!booking) return res.status(404).json({ message: "Booking not found" });

      if (booking.status !== "Requested" || booking.worker) {
        return res.status(400).json({ message: "Booking is no longer available" });
      }

      booking.worker = req.user._id;
      booking.workerName = req.user.name;
      booking.status = "Accepted";
      await booking.save();

      await User.findByIdAndUpdate(req.user._id, { "workerProfile.isAvailable": false });

      const io = req.app.get("io");
      await createNotification(io, {
        recipient: booking.customer,
        booking: booking._id,
        title: "Booking Accepted",
        message: `${req.user.name} has accepted your service request.`,
      });
      await createNotification(io, {
        recipient: req.user._id,
        booking: booking._id,
        title: "Booking Accepted",
        message: "You have successfully accepted the booking.",
      });

      if (io) {
        io.to(`user:${booking.customer}`).emit("booking:updated", booking);
        io.to(`user:${req.user._id}`).emit("booking:updated", booking);
      }

      res.json(booking);
    } catch (error) {
      console.error("[PATCH /bookings/:id/accept]", error);
      res.status(500).json({ message: isDev ? error.message : "Failed to accept booking" });
    }
  }
);

// PATCH /api/bookings/:id/start
router.patch(
  "/:id/start",
  [param("id").isMongoId().withMessage("Invalid booking ID")],
  async (req, res) => {
    const err = handleValidation(req, res);
    if (err) return;

    try {
      const booking = await Booking.findById(req.params.id);
      if (!booking || booking.worker?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      booking.status = "In Progress";
      await booking.save();

      const io = req.app.get("io");
      await createNotification(io, {
        recipient: booking.customer,
        booking: booking._id,
        title: "Service Started",
        message: `${req.user.name} has started the work.`,
      });

      if (io) {
        io.to(`user:${booking.customer}`).emit("booking:updated", booking);
        io.to(`user:${req.user._id}`).emit("booking:updated", booking);
      }

      res.json(booking);
    } catch (error) {
      console.error("[PATCH /bookings/:id/start]", error);
      res.status(500).json({ message: isDev ? error.message : "Failed to start booking" });
    }
  }
);

// PATCH /api/bookings/:id/complete
router.patch(
  "/:id/complete",
  [param("id").isMongoId().withMessage("Invalid booking ID")],
  async (req, res) => {
    const err = handleValidation(req, res);
    if (err) return;

    try {
      const booking = await Booking.findById(req.params.id);
      if (!booking || booking.worker?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      booking.status = "Completed";
      await booking.save();

      await User.findByIdAndUpdate(req.user._id, { "workerProfile.isAvailable": true });

      const io = req.app.get("io");
      await createNotification(io, {
        recipient: booking.customer,
        booking: booking._id,
        title: "Service Completed",
        message: `${req.user.name} has completed the work.`,
      });
      await createNotification(io, {
        recipient: req.user._id,
        booking: booking._id,
        title: "Service Completed",
        message: "You have completed the booking.",
      });

      if (io) {
        io.to(`user:${booking.customer}`).emit("booking:updated", booking);
        io.to(`user:${req.user._id}`).emit("booking:updated", booking);
      }

      res.json(booking);
    } catch (error) {
      console.error("[PATCH /bookings/:id/complete]", error);
      res.status(500).json({ message: isDev ? error.message : "Failed to complete booking" });
    }
  }
);

// PATCH /api/bookings/:id/cancel
router.patch(
  "/:id/cancel",
  [param("id").isMongoId().withMessage("Invalid booking ID")],
  async (req, res) => {
    const err = handleValidation(req, res);
    if (err) return;

    try {
      const booking = await Booking.findById(req.params.id);
      if (!booking) return res.status(404).json({ message: "Booking not found" });

      if (booking.customer.toString() !== req.user._id.toString() && req.user.role !== "Admin") {
        return res.status(403).json({ message: "Unauthorized" });
      }

      booking.status = "Cancelled";
      if (booking.worker) {
        await User.findByIdAndUpdate(booking.worker, { "workerProfile.isAvailable": true });
      }
      await booking.save();

      const io = req.app.get("io");
      await createNotification(io, {
        recipient: booking.customer,
        booking: booking._id,
        title: "Booking Cancelled",
        message: "Your booking has been cancelled.",
      });

      if (booking.worker) {
        await createNotification(io, {
          recipient: booking.worker,
          booking: booking._id,
          title: "Booking Cancelled",
          message: "The booking has been cancelled by the customer.",
        });
        if (io) io.to(`user:${booking.worker}`).emit("booking:updated", booking);
      }

      if (io) io.to(`user:${booking.customer}`).emit("booking:updated", booking);

      res.json(booking);
    } catch (error) {
      console.error("[PATCH /bookings/:id/cancel]", error);
      res.status(500).json({ message: isDev ? error.message : "Failed to cancel booking" });
    }
  }
);

export default router;
