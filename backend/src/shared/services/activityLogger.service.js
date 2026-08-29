import { ActivityLog } from '../../modules/activityLogs/activityLog.model.js';
import { Notification } from '../../modules/notifications/notification.model.js';

export const logActivityAndNotify = async ({
  entityType,
  entityId,
  action,
  actorId,
  metadata = {},
  notifications = [], // Array of { userId, type, title, message }
}) => {
  try {
    // 1. Write the ActivityLog
    await ActivityLog.create({
      entityType,
      entityId,
      action,
      actorId,
      metadata,
    });

    // 2. Fan-out Notifications if provided
    if (notifications.length > 0) {
      const notificationDocs = notifications.map((n) => ({
        userId: n.userId,
        type: n.type,
        title: n.title,
        message: n.message,
        relatedEntityType: entityType,
        relatedEntityId: entityId,
      }));
      await Notification.insertMany(notificationDocs);
    }
  } catch (error) {
    console.error('[activityLogger.service] Error logging activity:', error.stack || error);
    // Don't throw - we don't want to fail the main transaction just because logging failed
  }
};
