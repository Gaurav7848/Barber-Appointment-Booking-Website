import express from 'express';
import Appointment from '../models/appointment.model.js';
import Organization from '../models/organization.model.js';
import { protect, organization } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, async (req, res) => {
  try {
    const appointment = await Appointment.create(req.body);
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
      res.json(updatedAppointment);
    } else {
      res.status(403).json({ message: 'Not authorized' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (appointment && (appointment.userId.toString() === req.user._id.toString() || req.user.role === 'organization' || req.user.role === 'admin')) {
      appointment.status = 'cancelled';
      const updatedAppointment = await appointment.save();
      res.json(updatedAppointment);
    } else {
      res.status(403).json({ message: 'Not authorized' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
