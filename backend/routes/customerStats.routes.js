import express from 'express';
import mongoose from 'mongoose';
import Appointment from '../models/appointment.model.js';
import Review from '../models/review.model.js';
import { protect, organization, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/organization/:id', protect, organization, async (req, res) => {
  try {
    const orgId = req.params.id;
    const org = await mongoose.model('Organization').findById(orgId);
    if (!org) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    const totalAppointments = await Appointment.countDocuments({ organizationId: orgId });
    const completedAppointments = await Appointment.countDocuments({ organizationId: orgId, status: 'completed' });
    const pendingAppointments = await Appointment.countDocuments({ organizationId: orgId, status: 'pending' });
    const rejectedAppointments = await Appointment.countDocuments({ organizationId: orgId, status: 'rejected' });
    const totalCustomers = await Appointment.distinct('userId', { organizationId: orgId }).length;
    const totalReviews = await Review.countDocuments({ organizationId: orgId });

    const revenueData = await Appointment.aggregate([
      { $match: { organizationId: new mongoose.Types.ObjectId(orgId), status: 'completed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' } } },
    ]);

    const totalRevenue = revenueData[0]?.totalRevenue || 0;

    res.json({
      totalAppointments,
      completedAppointments,
      pendingAppointments,
      rejectedAppointments,
      totalCustomers,
      totalReviews,
      totalRevenue,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;