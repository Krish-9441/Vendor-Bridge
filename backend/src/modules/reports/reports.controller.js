import { 
  getDashboardSummary, 
  getSpendAnalytics, 
  getVendorPerformance, 
  getProcurementTrends,
  generateCsv
} from './reports.service.js';
import { sendSuccess, sendError } from '../../shared/utils/apiResponse.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';

export const getDashboardSummaryHandler = asyncHandler(async (req, res) => {
  const summary = await getDashboardSummary(req.user);
  return sendSuccess(res, 200, 'Dashboard summary retrieved successfully', summary);
});

export const getSpendHandler = asyncHandler(async (req, res) => {
  const { startDate, endDate, format } = req.query;
  const data = await getSpendAnalytics({ startDate, endDate });

  if (format === 'csv') {
    const csv = generateCsv(data);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=spend-analytics.csv');
    return res.send(csv);
  }

  return sendSuccess(res, 200, 'Spend analytics retrieved successfully', data);
});

export const getVendorPerformanceHandler = asyncHandler(async (req, res) => {
  const { format } = req.query;
  const data = await getVendorPerformance();

  if (format === 'csv') {
    const csv = generateCsv(data);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=vendor-performance.csv');
    return res.send(csv);
  }

  return sendSuccess(res, 200, 'Vendor performance retrieved successfully', data);
});

export const getProcurementTrendsHandler = asyncHandler(async (req, res) => {
  const { format } = req.query;
  const data = await getProcurementTrends();

  if (format === 'csv') {
    const csv = generateCsv(data);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=procurement-trends.csv');
    return res.send(csv);
  }

  return sendSuccess(res, 200, 'Procurement trends retrieved successfully', data);
});
