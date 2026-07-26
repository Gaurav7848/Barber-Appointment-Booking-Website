import mongoose from 'mongoose';

const barberSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  specialization: {
    type: String,
    required: true,
  },
  experience: {
    type: Number,
    required: true,
  },
  rating: {
    type: Number,
    default: 0,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
  avatar: {
    type: String,
  },
  bio: {
    type: String,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  workingHours: {
    start: String,
    end: String,
  },
  services: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
  }],
}, { timestamps: true });

const Barber = mongoose.model('Barber', barberSchema);
export default Barber;
