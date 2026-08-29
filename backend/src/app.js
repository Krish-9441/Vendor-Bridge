import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import { errorHandler } from './middleware/error.middleware.js';
import authRoutes from './modules/auth/auth.routes.js';
import vendorsRoutes from './modules/vendors/vendors.routes.js';
import rfqRoutes from './modules/rfq/rfq.routes.js';
import quotationRoutes from './modules/quotations/quotations.routes.js';
import approvalsRoutes from './modules/approvals/approvals.routes.js';
import purchaseOrdersRoutes from './modules/purchaseOrders/purchaseOrder.routes.js';
import invoiceRoutes from './modules/invoices/invoice.routes.js';
import notificationRoutes from './modules/notifications/notification.routes.js';
import activityLogRoutes from './modules/activityLogs/activityLog.routes.js';
import reportsRoutes from './modules/reports/reports.routes.js';

const app = express();

// ── Security & Core Middleware ─────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true, // required for httpOnly cookies cross-origin
}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/vendors', vendorsRoutes);
app.use('/api/v1/rfqs', rfqRoutes);
app.use('/api/v1/quotations', quotationRoutes);
app.use('/api/v1/approvals', approvalsRoutes);
app.use('/api/v1/purchase-orders', purchaseOrdersRoutes);
app.use('/api/v1/invoices', invoiceRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/activity-logs', activityLogRoutes);
app.use('/api/v1/reports', reportsRoutes);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use(errorHandler);

export default app;
