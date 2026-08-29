import { Rfq } from './rfq.model.js';
import { Quotation } from '../quotations/quotation.model.js';
import { User } from '../user/user.model.js';
import { generateSequenceNumber } from '../../shared/services/numberGenerator.service.js';
import { logActivityAndNotify } from '../../shared/services/activityLogger.service.js';

// Helper to get userIds for an array of vendorIds
const getUserIdsForVendors = async (vendorIds) => {
  const users = await User.find({ vendorId: { $in: vendorIds } });
  return users.map(u => u._id);
};

export const getRfqs = async ({ filter, sort, skip, limit }) => {
  const [rfqs, total] = await Promise.all([
    Rfq.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-itemDetails -attachments -description'),
    Rfq.countDocuments(filter),
  ]);

  // The spec requires `assignedVendorCount` and `quotationCount` computed fields
  // In a real app we would use aggregation, but for MVP, we'll map them
  const enrichedRfqs = await Promise.all(
    rfqs.map(async (rfq) => {
      const quotationCount = await Quotation.countDocuments({ rfqId: rfq._id });
      return {
        id: rfq._id,
        rfqNumber: rfq.rfqNumber,
        title: rfq.title,
        status: rfq.status,
        deadline: rfq.deadline,
        assignedVendorCount: rfq.assignedVendors ? rfq.assignedVendors.length : 0,
        quotationCount,
        createdAt: rfq.createdAt,
      };
    })
  );

  return { rfqs: enrichedRfqs, total };
};

export const getRfqById = async (id) => {
  const rfq = await Rfq.findById(id)
    .populate('assignedVendors', 'companyName') // We'll map responded in the controller
    .populate('createdBy', 'name')
    .lean();
  
  if (!rfq) return null;

  // Enhance assigned vendors with `responded` status
  if (rfq.assignedVendors) {
    const quotations = await Quotation.find({ rfqId: rfq._id }).lean();
    const vendorIdsWithQuotes = new Set(quotations.map(q => q.vendorId.toString()));
    
    rfq.assignedVendors = rfq.assignedVendors.map(v => ({
      id: v._id,
      companyName: v.companyName,
      responded: vendorIdsWithQuotes.has(v._id.toString()),
    }));
  }

  rfq.id = rfq._id;
  delete rfq._id;
  delete rfq.__v;

  return rfq;
};

export const createRfq = async (data, creatorId) => {
  const { title, description, itemDetails, deadline, vendorIds, publish } = data;

  const rfqNumber = await generateSequenceNumber('RFQ');
  const status = publish ? 'PUBLISHED' : 'DRAFT';

  const rfq = await Rfq.create({
    rfqNumber,
    title,
    description,
    itemDetails,
    deadline,
    status,
    assignedVendors: vendorIds || [],
    createdBy: creatorId,
  });

  const notifications = [];
  if (publish && vendorIds && vendorIds.length > 0) {
    const vendorUserIds = await getUserIdsForVendors(vendorIds);
    vendorUserIds.forEach(userId => {
      notifications.push({
        userId,
        type: 'RFQ_PUBLISHED',
        title: 'New RFQ Available',
        message: `You have been invited to quote for RFQ: ${rfqNumber} - ${title}`,
      });
    });
  }

  await logActivityAndNotify({
    entityType: 'RFQ',
    entityId: rfq._id,
    action: publish ? 'RFQ_PUBLISHED' : 'RFQ_DRAFT_CREATED',
    actorId: creatorId,
    notifications,
  });

  return rfq;
};

export const updateRfq = async (id, data, actorId) => {
  const rfq = await Rfq.findById(id);
  if (!rfq) throw new Error('NOT_FOUND');
  if (rfq.status !== 'DRAFT') throw new Error('CONFLICT: Can only edit DRAFT RFQs');

  Object.assign(rfq, data);
  await rfq.save();

  await logActivityAndNotify({
    entityType: 'RFQ',
    entityId: rfq._id,
    action: 'RFQ_UPDATED',
    actorId,
  });

  return rfq;
};

export const publishRfq = async (id, actorId) => {
  const rfq = await Rfq.findById(id);
  if (!rfq) throw new Error('NOT_FOUND');
  if (rfq.status !== 'DRAFT') throw new Error('CONFLICT: RFQ is not in DRAFT status');
  if (!rfq.assignedVendors || rfq.assignedVendors.length === 0) {
    throw new Error('VALIDATION_ERROR: Cannot publish RFQ without assigned vendors');
  }

  rfq.status = 'PUBLISHED';
  await rfq.save();

  const vendorUserIds = await getUserIdsForVendors(rfq.assignedVendors);
  const notifications = vendorUserIds.map(userId => ({
    userId,
    type: 'RFQ_PUBLISHED',
    title: 'New RFQ Available',
    message: `You have been invited to quote for RFQ: ${rfq.rfqNumber} - ${rfq.title}`,
  }));

  await logActivityAndNotify({
    entityType: 'RFQ',
    entityId: rfq._id,
    action: 'RFQ_PUBLISHED',
    actorId,
    notifications,
  });

  return rfq;
};

export const addAttachments = async (id, file, actorId) => {
  const rfq = await Rfq.findById(id);
  if (!rfq) throw new Error('NOT_FOUND');
  
  // Create relative path for DB
  const filePath = `/uploads/rfq/${file.filename}`;
  
  rfq.attachments.push({
    fileName: file.originalname,
    filePath,
    fileSize: file.size,
    uploadedAt: new Date(),
  });

  await rfq.save();

  await logActivityAndNotify({
    entityType: 'RFQ',
    entityId: rfq._id,
    action: 'RFQ_ATTACHMENT_ADDED',
    actorId,
    metadata: { fileName: file.originalname },
  });

  return rfq;
};

export const assignVendors = async (id, vendorIds, actorId) => {
  const rfq = await Rfq.findById(id);
  if (!rfq) throw new Error('NOT_FOUND');

  const currentVendors = rfq.assignedVendors.map(v => v.toString());
  const newVendors = vendorIds.filter(v => !currentVendors.includes(v.toString()));

  if (newVendors.length > 0) {
    rfq.assignedVendors.push(...newVendors);
    await rfq.save();

    const notifications = [];
    if (rfq.status === 'PUBLISHED') {
      const vendorUserIds = await getUserIdsForVendors(newVendors);
      vendorUserIds.forEach(userId => {
        notifications.push({
          userId,
          type: 'RFQ_PUBLISHED',
          title: 'New RFQ Available',
          message: `You have been assigned to an active RFQ: ${rfq.rfqNumber} - ${rfq.title}`,
        });
      });
    }

    await logActivityAndNotify({
      entityType: 'RFQ',
      entityId: rfq._id,
      action: 'RFQ_VENDORS_ASSIGNED',
      actorId,
      metadata: { addedVendorsCount: newVendors.length },
      notifications,
    });
  }

  return rfq;
};

export const cancelRfq = async (id, reason, actorId) => {
  const rfq = await Rfq.findById(id);
  if (!rfq) throw new Error('NOT_FOUND');
  if (['CLOSED', 'AWARDED', 'CANCELLED'].includes(rfq.status)) {
    throw new Error('CONFLICT: Cannot cancel an already closed/awarded/cancelled RFQ');
  }

  rfq.status = 'CANCELLED';
  await rfq.save();

  const vendorUserIds = await getUserIdsForVendors(rfq.assignedVendors);
  const notifications = vendorUserIds.map(userId => ({
    userId,
    type: 'RFQ_CANCELLED',
    title: 'RFQ Cancelled',
    message: `RFQ ${rfq.rfqNumber} has been cancelled. Reason: ${reason}`,
  }));

  await logActivityAndNotify({
    entityType: 'RFQ',
    entityId: rfq._id,
    action: 'RFQ_CANCELLED',
    actorId,
    metadata: { reason },
    notifications,
  });

  return rfq;
};

export const compareQuotations = async (rfqId) => {
  const rfq = await Rfq.findById(rfqId);
  if (!rfq) throw new Error('NOT_FOUND');

  const quotations = await Quotation.find({ rfqId, status: 'SUBMITTED' })
    .populate('vendorId', 'companyName rating contactEmail')
    .lean();

  if (quotations.length === 0) {
    return { rfq, quotations: [], metrics: { lowestPriceId: null, fastestDeliveryId: null } };
  }

  // Find lowest price
  let lowestPrice = Infinity;
  let lowestPriceId = null;

  // Find fastest delivery
  let fastestDelivery = Infinity;
  let fastestDeliveryId = null;

  quotations.forEach(q => {
    if (q.totalAmount < lowestPrice) {
      lowestPrice = q.totalAmount;
      lowestPriceId = q._id;
    }
    if (q.deliveryDays < fastestDelivery) {
      fastestDelivery = q.deliveryDays;
      fastestDeliveryId = q._id;
    }
  });

  // Decorate quotations with tags for the frontend
  const enrichedQuotations = quotations.map(q => ({
    ...q,
    id: q._id,
    isLowestPrice: q._id.toString() === lowestPriceId?.toString(),
    isFastestDelivery: q._id.toString() === fastestDeliveryId?.toString()
  }));

  return {
    rfq: {
      rfqNumber: rfq.rfqNumber,
      title: rfq.title,
      status: rfq.status
    },
    quotations: enrichedQuotations,
    metrics: {
      lowestPriceId,
      fastestDeliveryId
    }
  };
};
