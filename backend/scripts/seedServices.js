import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Service from '../models/service.model.js';

dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);

const orgId = '6a63b446fa1cb813c4db406d';

const services = [
  {
    name: 'Classic Haircut',
    category: 'haircut',
    price: 300,
    duration: 30,
    description: 'Professional classic haircut with styling',
    isActive: true,
    organizationId: orgId,
  },
  {
    name: 'Beard Trim',
    category: 'beard',
    price: 150,
    duration: 20,
    description: 'Expert beard trimming and shaping',
    isActive: true,
    organizationId: orgId,
  },
  {
    name: 'Hair Color',
    category: 'hair-color',
    price: 800,
    duration: 60,
    description: 'Vibrant hair coloring with premium products',
    isActive: true,
    organizationId: orgId,
  },
  {
    name: 'Full Service',
    category: 'hair-styling',
    price: 500,
    duration: 45,
    description: 'Haircut + Beard trim + Styling',
    isActive: true,
    organizationId: orgId,
  },
];

await Service.insertMany(services);
console.log('Seed services added:', services.length);

await mongoose.disconnect();
process.exit(0);
