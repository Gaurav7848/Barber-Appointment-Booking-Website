import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import organizationRoutes from './routes/organization.routes.js';
import barberRoutes from './routes/barber.routes.js';
import serviceRoutes from './routes/service.routes.js';
import appointmentRoutes from './routes/appointment.routes.js';
import reviewRoutes from './routes/review.routes.js';
import adminRoutes from './routes/admin.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import timeslotRoutes from './routes/timeslot.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import customerStatsRoutes from './routes/customerStats.routes.js';
import ensureAdmin from './scripts/ensureAdmin.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connection.on('connected', async () => {
  console.log('MongoDB connected');
  try {
    await ensureAdmin();
  } catch (err) {
    console.error('Admin ensure failed:', err);
  }
});

mongoose.connect(process.env.MONGODB_URI).catch((err) => {
  console.error('MongoDB connection error:', err.message);
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Barber Booking Platform API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/barbers', barberRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/timeslots', timeslotRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/customer-stats', customerStatsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
