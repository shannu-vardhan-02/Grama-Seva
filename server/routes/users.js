import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import { verifyToken, requireRole } from '../middleware/auth.js';
import { createNotification } from '../utils/notify.js';
import { calculateDistance } from '../utils/distance.js';

const router = express.Router();
router.use(verifyToken);
router.get('/', async (req, res) => {
  try {
    if (req.user.role === 'Admin') {
      const users = await User.find();
      return res.json(users);
    } else {
      const workers = await User.find({
        role: 'Worker',
        'workerProfile.isVerified': true,
      });
      return res.json(workers);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', requireRole('Admin'), async (req, res) => {
  try {
    const { name, email, password, role, phone, workerProfile } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);

    const userData = {
      name,
      email,
      passwordHash,
      role,
      phone,
      authProvider: 'local',
    };

    if (role === 'Worker' && workerProfile) {
      userData.workerProfile = workerProfile;
    }

    const user = await User.create(userData);
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/reviews', async (req, res) => {
  try {
    if (req.user.role !== 'Customer') {
      return res.status(403).json({ message: 'Only customers can post reviews' });
    }

    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.workerProfile) {
      user.workerProfile = {};
    }
    if (!user.workerProfile.reviews) {
      user.workerProfile.reviews = [];
    }

    const newReview = {
      customerName: req.user.name,
      rating: Number(rating),
      comment: comment || '',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    };

    user.workerProfile.reviews.push(newReview);

    const totalRating = user.workerProfile.reviews.reduce((sum, r) => sum + Number(r.rating), 0);
    user.workerProfile.averageRating = totalRating / user.workerProfile.reviews.length;
    user.workerProfile.reviewCount = user.workerProfile.reviews.length;

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/:id/verify', requireRole('Admin'), async (req, res) => {
  try {
    const { status } = req.body; // 'Approved' | 'Rejected'
    const user = await User.findById(req.params.id);

    if (!user || user.role !== 'Worker') {
      return res.status(404).json({ message: 'Worker not found' });
    }

    user.workerProfile.isVerified = status === 'Approved';
    if (user.workerProfile.proofOfWork && user.workerProfile.proofOfWork.length > 0) {
      user.workerProfile.proofOfWork.forEach((pow) => {
        pow.status = status;
      });
    }

    await user.save();

    const io = req.app.get('io');
    if (io) {
      io.to('role:Admin').emit('users:updated', user);
    }

    await createNotification(io, {
      recipient: user._id,
      title: 'Profile Verification',
      message: `Your worker profile has been ${status.toLowerCase()}.`,
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', requireRole('Admin'), async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete yourself' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/:id/profile', async (req, res) => {
  try {
    if (req.params.id !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { name, phone, workerProfile } = req.body;
    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;

    if (workerProfile) {
      for (const key in workerProfile) {
        updateData[`workerProfile.${key}`] = workerProfile[key];
      }
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
