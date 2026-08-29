import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    entityType: {
      type: String,
      enum: ['RFQ', 'QUOTATION', 'APPROVAL', 'PO', 'INVOICE', 'VENDOR', 'USER'],
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only need createdAt per spec
  }
);

export const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
