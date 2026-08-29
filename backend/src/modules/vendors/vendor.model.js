import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true },
    gstNumber: { type: String, required: true, unique: true },
    category: { type: String },
    contactName: { type: String },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String, required: true },
    address: { type: String },
    status: { type: String, enum: ['PENDING', 'ACTIVE', 'INACTIVE'], default: 'PENDING' },
    rating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Vendor = mongoose.model('Vendor', vendorSchema);
