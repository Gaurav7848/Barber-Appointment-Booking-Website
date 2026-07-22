import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/user.model.js';

dotenv.config();

const ensureAdmin = async () => {
  if (!process.env.MONGODB_URI) {
    console.warn('Missing MONGODB_URI, skipping admin seed');
    return
  }
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('MongoDB connected for seeding');
    }

    const adminEmail = 'admin@barberbook.com';
    const adminPassword = 'admin123';
    const existing = await User.findOne({ email: adminEmail });
    if (existing) {
      console.log('Admin already exists');
      return
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await User.create({
      name: 'Super Admin',
      email: adminEmail,
      phone: '9999999999',
      password: hashedPassword,
      role: 'admin',
      isVerified: true,
    });
    console.log('Admin user created:', adminEmail, adminPassword);
  } catch (error) {
    console.error('Admin seed error:', error.message);
  }
};

export default ensureAdmin;
