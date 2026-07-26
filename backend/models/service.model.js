import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  price: {
    type: Number,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    enum: ['haircut', 'beard', 'hair-styling', 'hair-color', 'facial', 'shaving', 'head-massage', 'hair-spa', 'other'],
    required: true,
  },
  image: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

const Service = mongoose.model('Service', serviceSchema);
export default Service;
