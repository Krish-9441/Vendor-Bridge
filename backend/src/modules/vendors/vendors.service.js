import { Vendor } from './vendor.model.js';
import { Rfq } from '../rfq/rfq.model.js';
import { Quotation } from '../quotations/quotation.model.js';
import { User } from '../user/user.model.js';
import { logActivityAndNotify } from '../../shared/services/activityLogger.service.js';

export const getVendors = async ({ filter, sort, skip, limit }) => {
  const [vendors, total] = await Promise.all([
    Vendor.find(filter).sort(sort).skip(skip).limit(limit),
    Vendor.countDocuments(filter),
  ]);
  return { vendors, total };
};

export const getVendorById = async (id) => {
  const vendor = await Vendor.findById(id).lean();
  if (!vendor) return null;

  const [totalRfqsInvited, totalQuotationsWon] = await Promise.all([
    Rfq.countDocuments({ assignedVendors: id }),
    Quotation.countDocuments({ vendorId: id, status: 'SELECTED' }),
  ]);

  return { ...vendor, id: vendor._id, totalRfqsInvited, totalQuotationsWon };
};

export const createVendor = async (data, creatorRole, creatorId) => {
  const status = creatorRole === 'ADMIN' ? 'ACTIVE' : 'PENDING';

  const existing = await Vendor.findOne({ gstNumber: data.gstNumber });
  if (existing) {
    throw new Error('Duplicate GST number');
  }

  const vendor = await Vendor.create({ ...data, status });

  if (creatorId) {
    await logActivityAndNotify({
      entityType: 'VENDOR',
      entityId: vendor._id,
      action: 'VENDOR_CREATED',
      actorId: creatorId,
    });
  }

  return vendor;
};

export const updateVendor = async (id, updateData, actorId) => {
  const vendor = await Vendor.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  if (!vendor) return null;

  if (actorId) {
    await logActivityAndNotify({
      entityType: 'VENDOR',
      entityId: vendor._id,
      action: 'VENDOR_UPDATED',
      actorId: actorId,
    });
  }

  return vendor;
};

export const updateVendorStatus = async (id, status, adminId) => {
  const vendor = await Vendor.findByIdAndUpdate(id, { status }, { new: true });
  if (!vendor) return null;

  const user = await User.findOne({ vendorId: id });
  const notifications = [];
  if (user && status === 'ACTIVE') {
    notifications.push({
      userId: user._id,
      type: 'VENDOR_ACTIVATED',
      title: 'Account Activated',
      message: 'Your vendor account has been activated.',
    });
  }

  await logActivityAndNotify({
    entityType: 'VENDOR',
    entityId: id,
    action: `VENDOR_STATUS_UPDATED`,
    actorId: adminId,
    metadata: { newStatus: status },
    notifications,
  });

  return vendor;
};
