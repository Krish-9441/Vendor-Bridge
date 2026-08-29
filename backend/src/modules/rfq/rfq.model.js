import mongoose from 'mongoose';

const rfqSchema = new mongoose.Schema(
  {
    rfqNumber: { type: String, unique: true },
    title: { type: String, required: true },
    description: { type: String },
    itemDetails: [
      {
        name: { type: String },
        quantity: { type: Number },
        unit: { type: String },
        specification: { type: String },
      },
    ],
    deadline: { type: Date, required: true },
    status: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED', 'EVALUATING', 'CLOSED', 'AWARDED', 'CANCELLED'],
    },
    assignedVendors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' }],
    attachments: [
      {
        fileName: { type: String },
        filePath: { type: String },
        fileSize: { type: Number },
        uploadedAt: { type: Date },
      },
    ],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const Rfq = mongoose.model('Rfq', rfqSchema);
