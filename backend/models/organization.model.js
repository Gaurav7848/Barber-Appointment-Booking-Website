import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  businessType: {
    type: String,
    enum: ['barber-shop', 'salon', 'unisex-salon', 'spa'],
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  pincode: {
    type: String,
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: {
      type: [Number],
    },
  },
  images: [String],
  coverImage: {
    type: String,
  },
  logo: {
    type: String,
  },
  contactPhone: {
    type: String,
    required: true,
  },
  contactEmail: {
    type: String,
    required: true,
  },
  openingTime: {
    type: String,
    required: true,
  },
  closingTime: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending',
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  rating: {
    type: Number,
    default: 0,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
  businessLicense: {
    type: String,
  },
  gstNumber: {
    type: String,
  },
  isOpen: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

organizationSchema.index({ location: '2dsphere' });

const Organization = mongoose.model('Organization', organizationSchema);
export default Organization;
