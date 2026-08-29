import { Notification } from './notification.model.js';

export const getUserNotifications = async (userId, { skip = 0, limit = 10, unreadOnly = false }) => {
  const filter = { userId };
  if (unreadOnly) {
    filter.isRead = false;
  }

  const [notifications, total] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Notification.countDocuments(filter)
  ]);

  return {
    notifications,
    pagination: {
      total,
      page: Math.floor(skip / limit) + 1,
      pages: Math.ceil(total / limit)
    }
  };
};

export const getUnreadCount = async (userId) => {
  const count = await Notification.countDocuments({ userId, isRead: false });
  return { count };
};

export const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { isRead: true, readAt: new Date() },
    { new: true }
  );
  
  if (!notification) throw new Error('NOT_FOUND');
  return notification;
};

export const markAllAsRead = async (userId) => {
  const result = await Notification.updateMany(
    { userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
  return { updatedCount: result.modifiedCount };
};
