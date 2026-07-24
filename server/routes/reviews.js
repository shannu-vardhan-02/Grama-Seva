import express from 'express';
import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';
import { createNotification } from '../utils/notify.js';

const router = express.Router();
router.use(verifyToken);

router.post('/', async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status !== 'Completed') {
      return res.status(400).json({ message: 'Can only review completed bookings' });
    }

    if (booking.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const existingReview = await Review.findOne({ booking: bookingId });
    if (existingReview) {
      return res.status(400).json({ message: 'Review already exists for this booking' });
    }

    const review = await Review.create({
      booking: bookingId,
      customer: req.user._id,
      customerName: req.user.name,
      worker: booking.worker,
      rating,
      comment,
    });

    // Recalculate worker's average rating
    const allReviews = await Review.find({ worker: booking.worker });
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / allReviews.length;

    await User.findByIdAndUpdate(booking.worker, {
      'workerProfile.averageRating': averageRating,
      'workerProfile.reviewCount': allReviews.length,
    });

    const io = req.app.get('io');
    await createNotification(io, {
      recipient: booking.worker,
      booking: bookingId,
      title: 'New Review',
      message: `You received a ${rating}-star review from ${req.user.name}.`,
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    let reviews;
    if (req.user.role === 'Admin') {
      reviews = await Review.find().sort({ createdAt: -1 });
    } else if (req.user.role === 'Customer') {
      reviews = await Review.find({ customer: req.user._id }).sort({ createdAt: -1 });
    } else if (req.user.role === 'Worker') {
      reviews = await Review.find({ worker: req.user._id }).sort({ createdAt: -1 });
    }
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
