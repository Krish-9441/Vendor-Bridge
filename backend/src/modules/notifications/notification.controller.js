import * as notificationService from './notification.service.js';
import { sendSuccess, sendError } from '../../shared/utils/apiResponse.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';

export const getUserNotifications = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  const unreadOnly = req.query.unreadOnly === 'true';

  const data = await notificationService.getUserNotifications(req.user.sub, { skip, limit, unreadOnly });
  return sendSuccess(res, 200, 'Notifications retrieved successfully', data);
});

export const getUnreadCount = asyncHandler(async (req, res) => {
  const data = await notificationService.getUnreadCount(req.user.sub);
  return sendSuccess(res, 200, 'Unread count retrieved', data);
});

export const markAsRead = asyncHandler(async (req, res) => {
  try {
    const data = await notificationService.markAsRead(req.params.id, req.user.sub);
    return sendSuccess(res, 200, 'Notification marked as read', data);
  } catch (err) {
    if (err.message === 'NOT_FOUND') return sendError(res, 404, 'Notification not found');
    throw err;
  }
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  const data = await notificationService.markAllAsRead(req.user.sub);
  return sendSuccess(res, 200, 'All notifications marked as read', data);
});
