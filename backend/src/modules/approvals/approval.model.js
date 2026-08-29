import mongoose from 'mongoose';

const approvalSchema = new mongoose.Schema(
  {
    quotationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation', unique: true },
    rfqId: { type: mongoose.Schema.Types.ObjectId, ref: 'Rfq' },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'] },
    remarks: { type: String },
    decidedAt: { type: Date },
  },
  { timestamps: true }
);

export const Approval = mongoose.model('Approval', approvalSchema);
