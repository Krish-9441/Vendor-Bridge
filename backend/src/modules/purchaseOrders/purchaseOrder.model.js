import mongoose from 'mongoose';

const purchaseOrderSchema = new mongoose.Schema(
  {
    poNumber: { type: String, unique: true },
    quotationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation', unique: true },
    approvalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Approval' },
    rfqId: { type: mongoose.Schema.Types.ObjectId, ref: 'Rfq' },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
    issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['ISSUED', 'ACKNOWLEDGED', 'COMPLETED', 'CANCELLED'] },
    totalAmount: { type: Number },
  },
  { timestamps: true }
);

export const PurchaseOrder = mongoose.model('PurchaseOrder', purchaseOrderSchema);
