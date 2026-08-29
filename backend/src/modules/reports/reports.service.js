import { Approval } from '../approvals/approval.model.js';
import { Rfq } from '../rfq/rfq.model.js';
import { PurchaseOrder } from '../purchaseOrders/purchaseOrder.model.js';
import { Invoice } from '../invoices/invoice.model.js';
import { Quotation } from '../quotations/quotation.model.js';
import { Vendor } from '../vendors/vendor.model.js';

export const getDashboardSummary = async (user) => {
  const role = user.role.toUpperCase();
  const userId = user.sub;

  if (role === 'PROCUREMENT_OFFICER' || role === 'ADMIN' || role === 'VIEWER') {
    const pendingApprovalsCount = await Approval.countDocuments({ status: 'PENDING' });
    const activeRfqsCount = await Rfq.countDocuments({ status: 'PUBLISHED' });

    const recentPurchaseOrders = await PurchaseOrder.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('vendorId', 'companyName')
      .lean();

    const formattedRecentPOs = recentPurchaseOrders.map(po => ({
      poNumber: po.poNumber,
      vendor: po.vendorId ? po.vendorId.companyName : null,
      totalAmount: po.totalAmount,
      status: po.status
    }));

    const recentInvoicesRaw = await Invoice.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const formattedRecentInvoices = recentInvoicesRaw.map(inv => ({
      invoiceNumber: inv.invoiceNumber,
      status: inv.status,
      totalAmount: inv.totalAmount
    }));

    const spendToDateAggregation = await Invoice.aggregate([
      { $match: { status: { $in: ['SENT', 'PAID'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const spendToDate = spendToDateAggregation.length > 0 ? spendToDateAggregation[0].total : 0;

    return {
      pendingApprovalsCount,
      activeRfqsCount,
      recentPurchaseOrders: formattedRecentPOs,
      recentInvoices: formattedRecentInvoices,
      spendToDate
    };
  }

  if (role === 'MANAGER') {
    const pendingApprovalsCount = await Approval.countDocuments({ status: 'PENDING' });
    const recentApprovals = await Approval.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({ path: 'quotationId', populate: { path: 'vendorId', select: 'companyName' } })
      .lean();

    return {
      pendingApprovalsCount,
      recentApprovals
    };
  }

  if (role === 'VENDOR') {
    // If user has vendorId in payload or we look it up by email
    let vendorId = user.vendorId;
    if (!vendorId) {
      const vendor = await Vendor.findOne({ contactEmail: user.email });
      if (vendor) {
        vendorId = vendor._id;
      }
    }

    if (!vendorId) {
      // Vendor not linked
      return {
        activeRfqsCount: 0,
        recentQuotations: [],
        recentPurchaseOrders: []
      };
    }

    const activeRfqsCount = await Rfq.countDocuments({ status: 'PUBLISHED', assignedVendors: vendorId });

    const recentQuotations = await Quotation.find({ vendorId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const recentPurchaseOrders = await PurchaseOrder.find({ vendorId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return {
      activeRfqsCount,
      recentQuotations,
      recentPurchaseOrders
    };
  }

  return {};
};

// ── Phase 11: Reports & Analytics ──────────────────────────────────────────

/**
 * Aggregates spend analytics by vendor over a given timeframe.
 */
export const getSpendAnalytics = async (filters) => {
  const match = { status: { $in: ['SENT', 'PAID'] } };
  
  if (filters.startDate && filters.endDate) {
    match.createdAt = {
      $gte: new Date(filters.startDate),
      $lte: new Date(filters.endDate)
    };
  }

  const spendData = await Invoice.aggregate([
    { $match: match },
    {
      $group: {
        _id: { vendorId: '$vendorId', month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
        totalSpend: { $sum: '$totalAmount' },
        invoiceCount: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'vendors',
        localField: '_id.vendorId',
        foreignField: '_id',
        as: 'vendor'
      }
    },
    { $unwind: '$vendor' },
    {
      $project: {
        vendorName: '$vendor.companyName',
        month: '$_id.month',
        year: '$_id.year',
        totalSpend: 1,
        invoiceCount: 1,
        _id: 0
      }
    },
    { $sort: { year: -1, month: -1, totalSpend: -1 } }
  ]);

  return spendData;
};

/**
 * Computes vendor performance based on Win Rate, Response Rate, and Avg Response Time.
 */
export const getVendorPerformance = async () => {
  // Aggregate from Quotation collection grouped by Vendor
  const vendorStats = await Quotation.aggregate([
    {
      $group: {
        _id: '$vendorId',
        totalQuotations: { $sum: 1 },
        awardedQuotations: {
          $sum: { $cond: [{ $eq: ['$status', 'AWARDED'] }, 1, 0] }
        },
        // We use deliveryDays as a proxy for promised turnaround time based on available schema
        avgPromisedDeliveryDays: { $avg: '$deliveryDays' }
      }
    },
    {
      $lookup: {
        from: 'vendors',
        localField: '_id',
        foreignField: '_id',
        as: 'vendor'
      }
    },
    { $unwind: '$vendor' },
    {
      $project: {
        vendorName: '$vendor.companyName',
        totalQuotations: 1,
        awardedQuotations: 1,
        winRate: { 
          $cond: [ { $eq: ['$totalQuotations', 0] }, 0, { $multiply: [{ $divide: ['$awardedQuotations', '$totalQuotations'] }, 100] } ] 
        },
        avgPromisedDeliveryDays: 1,
        _id: 0
      }
    },
    { $sort: { winRate: -1 } }
  ]);

  return vendorStats;
};

/**
 * Aggregates RFQ and PO volumes over time to show procurement trends.
 */
export const getProcurementTrends = async () => {
  const rfqVolume = await Rfq.aggregate([
    {
      $group: {
        _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
        rfqCount: { $sum: 1 }
      }
    }
  ]);

  const poVolume = await PurchaseOrder.aggregate([
    {
      $group: {
        _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
        poCount: { $sum: 1 },
        poTotalValue: { $sum: '$totalAmount' }
      }
    }
  ]);

  // Merge the two datasets manually in JS since they are separate collections
  const trendsMap = {};

  rfqVolume.forEach(item => {
    const key = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
    trendsMap[key] = { month: key, rfqCount: item.rfqCount, poCount: 0, poTotalValue: 0 };
  });

  poVolume.forEach(item => {
    const key = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
    if (!trendsMap[key]) {
      trendsMap[key] = { month: key, rfqCount: 0, poCount: 0, poTotalValue: 0 };
    }
    trendsMap[key].poCount = item.poCount;
    trendsMap[key].poTotalValue = item.poTotalValue;
  });

  const sortedTrends = Object.values(trendsMap).sort((a, b) => a.month.localeCompare(b.month));
  return sortedTrends;
};

/**
 * Utility to generate a plain text CSV string from JSON array
 */
export const generateCsv = (data) => {
  if (!data || data.length === 0) return '';
  
  // Extract headers
  const headers = Object.keys(data[0]);
  
  // Create header row
  let csvContent = headers.join(',') + '\n';
  
  // Map data rows
  data.forEach(row => {
    const rowValues = headers.map(header => {
      let value = row[header];
      if (value === null || value === undefined) value = '';
      
      // Escape quotes and wrap in quotes if there's a comma
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        value = `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csvContent += rowValues.join(',') + '\n';
  });

  return csvContent;
};
