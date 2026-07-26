import express from 'express';
import Organization from '../models/organization.model.js';
import { protect, organization, admin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.post('/', protect, async (req, res) => {
  try {
    console.log('Received organization data:', req.body);
    const orgData = { ...req.body, ownerId: req.user._id };
    const org = await Organization.create(orgData);
    console.log('Organization created:', org);
    res.status(201).json(org);
  } catch (error) {
    console.error('Organization creation error:', error);
    res.status(400).json({ message: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { city, search, page = 1, limit = 10 } = req.query;
    const query = { status: 'approved' };
    if (city) query.city = new RegExp(city, 'i');
    if (search) query.name = new RegExp(search, 'i');

    let userId = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const jwt = await import('jsonwebtoken');
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.default.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (e) {
        console.log('No valid token for org search');
      }
    }

    const approvedOrgs = await Organization.find(query)
      .populate('ownerId', 'name email')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    let userOrgs = [];
    if (userId) {
      userOrgs = await Organization.find({ ownerId: userId })
        .populate('ownerId', 'name email');
    }

    const allOrgs = [...approvedOrgs, ...userOrgs.filter(uo => !approvedOrgs.find(ao => ao._id.toString() === uo._id.toString()))];
    res.json(allOrgs);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const org = await Organization.findById(req.params.id).populate('ownerId', 'name email');
    if (org) {
      res.json(org);
    } else {
      res.status(404).json({ message: 'Organization not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/:id/stats', protect, organization, async (req, res) => {
  try {
    const orgId = req.params.id;
    const AppointmentModel = mongoose.model('Appointment');
    const ReviewModel = mongoose.model('Review');

    const totalAppointments = await AppointmentModel.countDocuments({ organizationId: orgId });
    const completedAppointments = await AppointmentModel.countDocuments({ organizationId: orgId, status: 'completed' });
    const pendingAppointments = await AppointmentModel.countDocuments({ organizationId: orgId, status: 'pending' });
    const rejectedAppointments = await AppointmentModel.countDocuments({ organizationId: orgId, status: 'rejected' });
    const totalCustomers = await AppointmentModel.distinct('userId', { organizationId: orgId }).length;
    const totalReviews = await ReviewModel.countDocuments({ organizationId: orgId });

    const revenueData = await AppointmentModel.aggregate([
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

router.put('/:id', protect, organization, upload.array('images', 5), async (req, res) => {
  try {
    const org = await Organization.findById(req.params.id);
    if (org && org.ownerId.toString() === req.user._id.toString()) {
      const updateData = { ...req.body };
      if (req.files) {
        updateData.images = req.files.map(file => file.path);
      }
      const updatedOrg = await Organization.findByIdAndUpdate(req.params.id, updateData, { new: true });
      res.json(updatedOrg);
    } else {
      res.status(403).json({ message: 'Not authorized' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/:id/upload', protect, upload.array('images', 5), async (req, res) => {
  try {
    const org = await Organization.findById(req.params.id);
    if (!org) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    const isOwner = org.ownerId.toString() === req.user._id.toString();
    if (!isOwner) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const uploadedPaths = req.files.map(file => file.path);
    org.images = [...(org.images || []), ...uploadedPaths];
    await org.save();

    res.json({ images: org.images });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', protect, organization, async (req, res) => {
  try {
    const org = await Organization.findById(req.params.id);
    if (org && org.ownerId.toString() === req.user._id.toString()) {
      await org.deleteOne();
      res.json({ message: 'Organization removed' });
    } else {
      res.status(403).json({ message: 'Not authorized' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
