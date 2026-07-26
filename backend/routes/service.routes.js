import express from 'express';
import Service from '../models/service.model.js';
import Organization from '../models/organization.model.js';
import { protect, organization, admin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.post('/', protect, organization, upload.single('image'), async (req, res) => {
  try {
    const org = await Organization.findOne({ ownerId: req.user._id });
    if (!org) return res.status(404).json({ message: 'Organization not found' });
    const serviceData = { ...req.body, organizationId: org._id };
    if (req.file) {
      serviceData.image = req.file.path;
    }
    const service = await Service.create(serviceData);
    res.status(201).json(service);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/organization/:orgId', async (req, res) => {
  try {
    const services = await Service.find({ organizationId: req.params.orgId, isActive: true });
    res.json(services);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', protect, organization, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    const org = await Organization.findOne({ ownerId: req.user._id });
    if (service && service.organizationId.toString() === org._id.toString()) {
      const updatedService = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(updatedService);
    } else {
      res.status(403).json({ message: 'Not authorized' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', protect, organization, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    const org = await Organization.findOne({ ownerId: req.user._id });
    if (service && service.organizationId.toString() === org._id.toString()) {
      await service.deleteOne();
      res.json({ message: 'Service removed' });
    } else {
      res.status(403).json({ message: 'Not authorized' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
