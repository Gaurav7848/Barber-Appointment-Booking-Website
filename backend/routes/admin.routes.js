import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import Organization from '../models/organization.model.js';
import Appointment from '../models/appointment.model.js';
import Barber from '../models/barber.model.js';
import Service from '../models/service.model.js';
import Review from '../models/review.model.js';

const router = express.Router();

router.get('/stats', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Not authorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized as admin' });
    }

    const totalUsers = await User.countDocuments();
    const totalOrganizations = await Organization.countDocuments();
    const pendingOrganizations = await Organization.countDocuments({ status: 'pending' });
    const totalAppointments = await Appointment.countDocuments();
    const totalRevenue = await Appointment.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalReviews = await Review.countDocuments();

    const recentAppointments = await Appointment.find()
      .populate('userId', 'name email')
      .populate('organizationId', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    const recentOrganizations = await Organization.find()
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      stats: {
        totalUsers,
        totalOrganizations,
        pendingOrganizations,
        totalAppointments,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalReviews,
      },
      recentAppointments,
      recentOrganizations,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);
    if (user) {
      user.role = role;
      await user.save();
      res.json({ _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/organizations', async (req, res) => {
  try {
    const organizations = await Organization.find()
      .populate('ownerId', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(organizations);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/organizations/:id/verify', async (req, res) => {
  try {
    const org = await Organization.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', isVerified: true },
      { new: true }
    );
    res.json(org);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/organizations/:id/reject', async (req, res) => {
  try {
    const org = await Organization.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );
    res.json(org);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/organizations/:id/suspend', async (req, res) => {
  try {
    const org = await Organization.findByIdAndUpdate(
      req.params.id,
      { status: 'suspended' },
      { new: true }
    );
    res.json(org);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/appointments', async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('userId', 'name email')
      .populate('organizationId', 'name')
      .populate('barberId', 'name')
      .populate('serviceId', 'name price')
      .sort({ date: -1 })
      .limit(50);
    res.json(appointments);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/reviews', async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('userId', 'name')
      .populate('organizationId', 'name')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(reviews);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/reviews/:id', async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: 'Review deleted' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/revenue', async (req, res) => {
  try {
    const revenue = await Appointment.aggregate([
      { $match: { paymentStatus: 'paid' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          dailyRevenue: { $sum: '$amount' },
          appointmentCount: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 30 },
    ]);
    res.json(revenue);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
