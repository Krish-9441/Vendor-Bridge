import { ActivityLog } from './activityLog.model.js';

export const getActivityLogs = async ({ filter, sort, skip, limit }) => {
  const [logs, total] = await Promise.all([
    ActivityLog.find(filter)
      .populate('actorId', 'name email role')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    ActivityLog.countDocuments(filter)
  ]);

  return {
    logs,
    pagination: {
      total,
      page: Math.floor(skip / limit) + 1,
      pages: Math.ceil(total / limit)
    }
  };
};

export const getEntityLogs = async (entityType, entityId) => {
  const logs = await ActivityLog.find({ entityType, entityId })
    .populate('actorId', 'name email role')
    .sort({ createdAt: -1 })
    .lean();
    
  return logs;
};
