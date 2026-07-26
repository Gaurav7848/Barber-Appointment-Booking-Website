import express from 'express';
import Appointment from '../models/appointment.model.js';
import Organization from '../models/organization.model.js';
import Notification from '../models/notification.model.js';
import { protect, organization } from '../middleware/auth.js';

const router = express.Router();

const createNotification = async (userId, organizationId, title, message, type = 'appointment', data = {}) => {
  await Notification.create({
    userId,
    organizationId,
    title,
    message,
    type,
    data,
  });
};

router.post('/', protect, async (req, res) => {
  try {
    const appointment = await Appointment.create(req.body);

    if (req.body.paymentMethod === 'online') {
      await createNotification(
        req.body.userId,
        req.body.organizationId,
        'Appointment Created',
        'Your appointment has been created. Please complete the payment.',
        'appointment',
        { appointmentId: appointment._id }
      );
    } else {
      await createNotification(
        req.body.userId,
        req.body.organizationId,
        'Appointment Created',
        'Your appointment has been successfully created.',
        'appointment',
        { appointmentId: appointment._id }
      );
    }

    res.status(201).json(appointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/customer', protect, async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.user._id })
      .populate('organizationId', 'name address images')
      .populate('barberId', 'name avatar')
      .populate('serviceId', 'name price duration')
      .sort({ createdAt: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/organization/:orgId', protect, organization, async (req, res) => {
  try {
    const appointments = await Appointment.find({ organizationId: req.params.orgId })
      .populate('userId', 'name email phone')
      .populate('barberId', 'name avatar')
      .populate('serviceId', 'name price duration')
      .sort({ date: 1 });
    res.json(appointments);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id/status', protect, organization, async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    const org = await Organization.findOne({ ownerId: req.user._id });
    if (appointment && appointment.organizationId.toString() === org._id.toString()) {
      appointment.status = status;
      const updatedAppointment = await appointment.save();

      await createNotification(
        appointment.userId,
        appointment.organizationId,
        'Appointment Updated',
        `Your appointment status has been changed to ${status}.`,
        'appointment',
        { appointmentId: appointment._id }
      );

      res.json(updatedAppointment);
    } else {
      res.status(403).json({ message: 'Not authorized' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id/reschedule', protect, async (req, res) => {
  try {
    const { date, timeSlot } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const isOwner = appointment.userId.toString() === req.user._id.toString();
    const isOrg = req.user.role === 'organization' || req.user.role === 'admin';
    const org = await Organization.findOne({ ownerId: req.user._id });
    const belongToOrg = org && appointment.organizationId.toString() === org._id.toString();

    if (!isOwner && !(isOrg && belongToOrg)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    appointment.date = date || appointment.date;
    appointment.timeSlot = timeSlot || appointment.timeSlot;
    appointment.status = appointment.status === 'confirmed' ? 'rescheduled' : appointment.status;

    const updatedAppointment = await appointment.save();

    await createNotification(
      appointment.userId,
      appointment.organizationId,
      'Appointment Rescheduled',
      'Your appointment has been rescheduled.',
      'appointment',
      { appointmentId: appointment._id }
    );

    res.json(updatedAppointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const isOwner = appointment.userId.toString() === req.user._id.toString();
    const isOrg = req.user.role === 'organization' || req.user.role === 'admin';
    const org = await Organization.findOne({ ownerId: req.user._id });
    const belongToOrg = org && appointment.organizationId.toString() === org._id.toString();

    if (!isOwner && !(isOrg && belongToOrg)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    appointment.status = 'cancelled';
    const updatedAppointment = await appointment.save();

    await createNotification(
      appointment.userId,
      appointment.organizationId,
      'Appointment Cancelled',
      'Your appointment has been cancelled.',
      'appointment',
      { appointmentId: appointment._id }
    );

    res.json(updatedAppointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/organization/:orgId/stats', protect, organization, async (req, res) => {
  try {
    const org = await Organization.findOne({ ownerId: req.user._id });
    if (!org || org._id.toString() !== req.params.orgId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const todayAppointments = await Appointment.countDocuments({
      organizationId: req.params.orgId,
      date: { $gte: today, $lt: tomorrow },
    });

    const monthAppointments = await Appointment.countDocuments({
      organizationId: req.params.orgId,
      date: { $gte: monthStart },
    });

    const todayRevenue = await Appointment.aggregate([
      { $match: { organizationId: org._id, date: { $gte: today, $lt: tomorrow }, paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const monthRevenue = await Appointment.aggregate([
      { $match: { organizationId: org._id, date: { $gte: monthStart }, paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    res.json({
      today: { appointments: todayAppointments, revenue: todayRevenue[0]?.total || 0 },
      month: { appointments: monthAppointments, revenue: monthRevenue[0]?.total || 0 },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
