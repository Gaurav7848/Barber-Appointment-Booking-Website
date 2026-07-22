import express from 'express';
import Barber from '../models/barber.model.js';
import Organization from '../models/organization.model.js';
import { protect, organization, admin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.post('/', protect, organization, upload.single('avatar'), async (req, res) => {
  try {
    const org = await Organization.findOne({ ownerId: req.user._id });
    if (!org) return res.status(404).json({ message: 'Organization not found' });
    const barberData = { ...req.body, organizationId: org._id };
    if (req.file) {
      barberData.avatar = req.file.path;
    }
    const barber = await Barber.create(barberData);
    res.status(201).json(barber);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/organization/:orgId', async (req, res) => {
  try {
    const barbers = await Barber.find({ organizationId: req.params.orgId });
    res.json(barbers);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const barber = await Barber.findById(req.params.id);
    if (barber) {
      res.json(barber);
    } else {
      res.status(404).json({ message: 'Barber not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', protect, organization, async (req, res) => {
  try {
    const barber = await Barber.findById(req.params.id);
    const org = await Organization.findOne({ ownerId: req.user._id });
    if (barber && barber.organizationId.toString() === org._id.toString()) {
      const updatedBarber = await Barber.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(updatedBarber);
    } else {
      res.status(403).json({ message: 'Not authorized' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', protect, organization, async (req, res) => {
  try {
    const barber = await Barber.findById(req.params.id);
    const org = await Organization.findOne({ ownerId: req.user._id });
    if (barber && barber.organizationId.toString() === org._id.toString()) {
      await barber.deleteOne();
      res.json({ message: 'Barber removed' });
    } else {
      res.status(403).json({ message: 'Not authorized' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
