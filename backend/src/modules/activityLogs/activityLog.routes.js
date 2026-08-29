import express from 'express';
import { verifyToken, requireRole } from '../../middleware/auth.middleware.js';
import * as activityLogController from './activityLog.controller.js';

const router = express.Router();

router.use(verifyToken, requireRole(['PROCUREMENT_OFFICER', 'MANAGER', 'ADMIN']));

router.get('/', activityLogController.getActivityLogs);
router.get('/:entityType/:entityId', activityLogController.getEntityLogs);

export default router;
