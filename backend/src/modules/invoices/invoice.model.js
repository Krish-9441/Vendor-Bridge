import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, unique: true },
    purchaseOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseOrder', unique: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
    subtotal: { type: Number },
    taxRate: { type: Number },
    taxAmount: { type: Number },
    totalAmount: { type: Number },
    status: { type: String, enum: ['GENERATED', 'SENT', 'PAID'] },
    pdfPath: { type: String },
    sentAt: { type: Date },
  },
  { timestamps: true }
);

export const Invoice = mongoose.model('Invoice', invoiceSchema);
