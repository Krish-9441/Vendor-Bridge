import mongoose from 'mongoose';

const quotationSchema = new mongoose.Schema(
  {
    rfqId: { type: mongoose.Schema.Types.ObjectId, ref: 'Rfq', required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    unitPrice: { type: Number, required: true },
    quantity: { type: Number, required: true },
    totalAmount: { type: Number },
    deliveryDays: { type: Number, required: true },
    notes: { type: String },
    status: {
      type: String,
      enum: ['SUBMITTED', 'SELECTED', 'REJECTED', 'WITHDRAWN', 'AWARDED'],
    },
    submittedAt: { type: Date },
  },
  { timestamps: true }
);

quotationSchema.index({ rfqId: 1, vendorId: 1 }, { unique: true });

export const Quotation = mongoose.model('Quotation', quotationSchema);
