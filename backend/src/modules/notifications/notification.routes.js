import express from 'express';
import { verifyToken } from '../../middleware/auth.middleware.js';
import * as notificationController from './notification.controller.js';

const router = express.Router();

router.use(verifyToken); // All endpoints require authentication

router.get('/', notificationController.getUserNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.patch('/read-all', notificationController.markAllAsRead);
router.patch('/:id/read', notificationController.markAsRead);

export default router;
