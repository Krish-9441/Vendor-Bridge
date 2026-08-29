import { sendSuccess, sendError } from '../../shared/utils/apiResponse.js';
import { getPaginationOptions, formatPaginationMeta } from '../../shared/utils/pagination.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';
import * as vendorService from './vendors.service.js';

export const getVendors = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort } = getPaginationOptions(req.query);
  const filter = {};

  if (req.query.status) filter.status = req.query.status;
  if (req.query.category) filter.category = req.query.category;
  if (req.query.search) {
    filter.$or = [
      { companyName: { $regex: req.query.search, $options: 'i' } },
      { contactEmail: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  // Role-based access: Vendor can only read their own record
  if (req.user.role === 'VENDOR') {
    if (!req.user.vendorId) {
       return sendSuccess(res, 200, 'Vendors retrieved successfully', [], formatPaginationMeta(0, page, limit));
    }
    filter._id = req.user.vendorId;
  }

  const { vendors, total } = await vendorService.getVendors({ filter, sort, skip, limit });
  const meta = formatPaginationMeta(total, page, limit);

  // Map to match the exact spec
  const data = vendors.map((v) => ({
    id: v._id,
    companyName: v.companyName,
    gstNumber: v.gstNumber,
    category: v.category,
    status: v.status,
    rating: v.rating,
    contactEmail: v.contactEmail,
    contactPhone: v.contactPhone,
  }));

  // Workaround: Spec does not include "message" field in successful GET /vendors response payload
  // However, `sendSuccess` helper adds a message.
  return sendSuccess(res, 200, 'Vendors retrieved successfully', data, meta);
});

export const getVendorById = asyncHandler(async (req, res) => {
  // Role-based access check
  if (req.user.role === 'VENDOR' && req.user.vendorId !== req.params.id) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  const vendor = await vendorService.getVendorById(req.params.id);
  if (!vendor) {
    return res.status(404).json({ success: false, message: 'Vendor not found' });
  }

  // Format response keys to match spec exactly
  const { _id, __v, ...vendorData } = vendor;

  return sendSuccess(res, 200, 'Vendor retrieved successfully', vendorData);
});

export const createVendor = asyncHandler(async (req, res) => {
  try {
    const vendor = await vendorService.createVendor(req.body, req.user.role, req.user.sub);
    
    // Format response keys
    const { _id, __v, ...vendorData } = vendor.toObject();
    const data = { ...vendorData, id: _id };
    
    return sendSuccess(res, 201, 'Vendor created successfully', data);
  } catch (err) {
    if (err.message === 'Duplicate GST number') {
      return res.status(409).json({ success: false, message: 'GST Number already exists' });
    }
    throw err;
  }
});

export const updateVendor = asyncHandler(async (req, res) => {
  // Role-based access check
  if (req.user.role === 'VENDOR') {
    if (req.user.vendorId !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    // Spec: Vendor can only update own contactName/contactEmail/contactPhone/address
    const allowedKeys = ['contactName', 'contactEmail', 'contactPhone', 'address'];
    const updateKeys = Object.keys(req.body);
    for (const key of updateKeys) {
      if (!allowedKeys.includes(key)) {
         return res.status(403).json({ success: false, message: 'Forbidden to update field: ' + key });
      }
    }
  }

  const vendor = await vendorService.updateVendor(req.params.id, req.body, req.user.sub);
  if (!vendor) {
    return res.status(404).json({ success: false, message: 'Vendor not found' });
  }

  // Format response keys
  const { _id, __v, ...vendorData } = vendor.toObject();
  const data = { ...vendorData, id: _id };

  return sendSuccess(res, 200, 'Vendor updated successfully', data);
});

export const updateVendorStatus = asyncHandler(async (req, res) => {
  const vendor = await vendorService.updateVendorStatus(req.params.id, req.body.status, req.user.sub);
  if (!vendor) {
    return res.status(404).json({ success: false, message: 'Vendor not found' });
  }

  // Format response keys
  const { _id, __v, ...vendorData } = vendor.toObject();
  const data = { ...vendorData, id: _id };

  return sendSuccess(res, 200, 'Vendor status updated successfully', data);
});
