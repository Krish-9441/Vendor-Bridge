import { Router } from 'express';
import { verifyToken, requireRole } from '../../middleware/auth.middleware.js';
import {
  getDashboardSummaryHandler,
  getSpendHandler,
  getVendorPerformanceHandler,
  getProcurementTrendsHandler
} from './reports.controller.js';

const router = Router();

const analyticsRoles = ['PROCUREMENT_OFFICER', 'MANAGER', 'ADMIN'];

router.use(verifyToken);

// Dashboard (all roles)
router.get('/dashboard-summary', getDashboardSummaryHandler);

// Analytics (officer / manager / admin only)
// Supports ?format=csv for CSV export — returns plain text CSV, no binary
router.get('/spend', requireRole(analyticsRoles), getSpendHandler);
router.get('/vendor-performance', requireRole(analyticsRoles), getVendorPerformanceHandler);
router.get('/trends', requireRole(analyticsRoles), getProcurementTrendsHandler);

export default router;
