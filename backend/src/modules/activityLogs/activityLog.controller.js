import * as activityLogService from './activityLog.service.js';
import { sendSuccess } from '../../shared/utils/apiResponse.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';

export const getActivityLogs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.entityType) filter.entityType = req.query.entityType;
  if (req.query.action) filter.action = req.query.action;
  
  const sort = { createdAt: -1 };

  const data = await activityLogService.getActivityLogs({ filter, sort, skip, limit });
  return sendSuccess(res, 200, 'Activity logs retrieved successfully', data);
});

export const getEntityLogs = asyncHandler(async (req, res) => {
  const data = await activityLogService.getEntityLogs(req.params.entityType, req.params.entityId);
  return sendSuccess(res, 200, 'Entity logs retrieved successfully', data);
});
