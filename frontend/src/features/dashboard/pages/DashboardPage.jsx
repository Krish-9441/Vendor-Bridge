import React from 'react';
import { motion } from 'framer-motion';
import { useDashboardSummary } from '../api/dashboardHooks';
import useAuthStore from '../../../store/useAuthStore';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.1 } 
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: 'spring', stiffness: 100 }
  }
};

const DashboardPage = () => {
  const { user } = useAuthStore();
  const { data: response, isPending, isError, error } = useDashboardSummary();

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-full p-10">
        <Loader2 className="w-8 h-8 animate-spin text-[#8A3223]" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-10">
        <div className="p-4 border border-[#8A3223] bg-[#F4EFE3] text-[#8A3223] rounded-sm font-['IBM_Plex_Mono'] text-sm">
          Failed to load dashboard data: {error?.response?.data?.message || error.message}
        </div>
      </div>
    );
  }

  const role = user?.role?.toUpperCase();
  const data = response?.data || {};

  // Formatter for currency
  const formatCurrency = (val) => {
    if (!val) return '₹0';
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const renderStats = () => {
    if (role === 'PROCUREMENT_OFFICER' || role === 'ADMIN' || role === 'VIEWER') {
      return (
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-9">
          <StatCard title="Pending Approvals" value={data.pendingApprovalsCount || 0} />
          <StatCard title="Active RFQs" value={data.activeRfqsCount || 0} />
          <StatCard title="Purchase Orders" value={data.recentPurchaseOrders?.length || 0} />
          <StatCard title="Total Spend" value={formatCurrency(data.spendToDate)} isLarge />
        </motion.div>
      );
    }
    
    if (role === 'MANAGER') {
      return (
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-9">
          <StatCard title="Pending Approvals" value={data.pendingApprovalsCount || 0} />
          <StatCard title="Total Reviewed" value="—" />
        </motion.div>
      );
    }

    if (role === 'VENDOR') {
      return (
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-9">
          <StatCard title="Active RFQs" value={data.activeRfqsCount || 0} />
          <StatCard title="Recent Quotations" value={data.recentQuotations?.length || 0} />
          <StatCard title="Purchase Orders" value={data.recentPurchaseOrders?.length || 0} />
        </motion.div>
      );
    }
    return null;
  };

  const renderLists = () => {
    if (role === 'PROCUREMENT_OFFICER' || role === 'ADMIN' || role === 'VIEWER') {
      return (
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-5 mb-5">
          <div className="border-[1.5px] border-[#231F16] bg-[#F4EFE3]">
            <div className="flex justify-between items-center px-5 py-4 border-b-[1.5px] border-[#231F16]">
              <h3 className="font-['Fraunces'] font-semibold text-[16px]">Recent purchase orders</h3>
              <Link to="/purchase-orders" className="font-['IBM_Plex_Mono'] text-[11.5px] text-[#8A3223] hover:underline">View all →</Link>
            </div>
            
            {(!data.recentPurchaseOrders || data.recentPurchaseOrders.length === 0) ? (
              <div className="p-6 text-center font-['IBM_Plex_Mono'] text-sm text-[#6b6349]">No recent purchase orders.</div>
            ) : (
              <div>
                <div className="grid grid-cols-[90px_1fr_120px_90px] items-center px-5 py-3 border-b border-[#C9C0A8] font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-wide text-[#6b6349]">
                  <span>PO No.</span><span>Vendor</span><span>Amount</span><span>Status</span>
                </div>
                {data.recentPurchaseOrders.map((po, idx) => (
                  <div key={idx} className="grid grid-cols-[90px_1fr_120px_90px] items-center px-5 py-3 border-b border-[#C9C0A8] last:border-0 text-[13px]">
                    <span className="font-['IBM_Plex_Mono'] text-[#4A4535]">{po.poNumber}</span>
                    <span className="truncate pr-2">{po.vendor || 'Unknown Vendor'}</span>
                    <span className="font-['IBM_Plex_Mono']">₹{po.totalAmount?.toLocaleString('en-IN')}</span>
                    <StatusBadge status={po.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-[1.5px] border-[#231F16] bg-[#F4EFE3]">
            <div className="flex justify-between items-center px-5 py-4 border-b-[1.5px] border-[#231F16]">
              <h3 className="font-['Fraunces'] font-semibold text-[16px]">Recent Invoices</h3>
              <Link to="/invoices" className="font-['IBM_Plex_Mono'] text-[11.5px] text-[#8A3223] hover:underline">View all →</Link>
            </div>
            
            {(!data.recentInvoices || data.recentInvoices.length === 0) ? (
              <div className="p-6 text-center font-['IBM_Plex_Mono'] text-sm text-[#6b6349]">No recent invoices.</div>
            ) : (
              <div>
                {data.recentInvoices.map((inv, idx) => (
                  <div key={idx} className="flex justify-between items-center px-5 py-3.5 border-b border-[#C9C0A8] last:border-0">
                    <div>
                      <h4 className="font-semibold text-[13.5px] mb-1">{inv.invoiceNumber}</h4>
                      <span className="font-['IBM_Plex_Mono'] text-[11px] text-[#6b6349]">₹{inv.totalAmount?.toLocaleString('en-IN')}</span>
                    </div>
                    <StatusBadge status={inv.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      );
    }
    
    if (role === 'MANAGER') {
      return (
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
           <div className="border-[1.5px] border-[#231F16] bg-[#F4EFE3]">
            <div className="flex justify-between items-center px-5 py-4 border-b-[1.5px] border-[#231F16]">
              <h3 className="font-['Fraunces'] font-semibold text-[16px]">Pending your approval</h3>
              <Link to="/approvals" className="font-['IBM_Plex_Mono'] text-[11.5px] text-[#8A3223] hover:underline">View all →</Link>
            </div>
            {(!data.recentApprovals || data.recentApprovals.length === 0) ? (
              <div className="p-6 text-center font-['IBM_Plex_Mono'] text-sm text-[#6b6349]">No pending approvals.</div>
            ) : (
              <div>
                {data.recentApprovals.map((app, idx) => (
                  <div key={idx} className="flex justify-between items-center px-5 py-3.5 border-b border-[#C9C0A8] last:border-0">
                    <div>
                      <h4 className="font-semibold text-[13.5px] mb-1">Approval for Quotation</h4>
                      <span className="font-['IBM_Plex_Mono'] text-[11px] text-[#6b6349]">{app.quotationId?.vendorId?.companyName || 'Unknown Vendor'}</span>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      );
    }

    if (role === 'VENDOR') {
      return (
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-5 mb-5">
          <div className="border-[1.5px] border-[#231F16] bg-[#F4EFE3]">
            <div className="flex justify-between items-center px-5 py-4 border-b-[1.5px] border-[#231F16]">
              <h3 className="font-['Fraunces'] font-semibold text-[16px]">Recent Purchase Orders</h3>
              <Link to="/purchase-orders" className="font-['IBM_Plex_Mono'] text-[11.5px] text-[#8A3223] hover:underline">View all →</Link>
            </div>
            
            {(!data.recentPurchaseOrders || data.recentPurchaseOrders.length === 0) ? (
              <div className="p-6 text-center font-['IBM_Plex_Mono'] text-sm text-[#6b6349]">No recent purchase orders.</div>
            ) : (
              <div>
                <div className="grid grid-cols-[100px_1fr_100px] items-center px-5 py-3 border-b border-[#C9C0A8] font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-wide text-[#6b6349]">
                  <span>PO No.</span><span>Amount</span><span>Status</span>
                </div>
                {data.recentPurchaseOrders.map((po, idx) => (
                  <div key={idx} className="grid grid-cols-[100px_1fr_100px] items-center px-5 py-3 border-b border-[#C9C0A8] last:border-0 text-[13px]">
                    <span className="font-['IBM_Plex_Mono'] text-[#4A4535]">{po.poNumber}</span>
                    <span className="font-['IBM_Plex_Mono']">₹{po.totalAmount?.toLocaleString('en-IN')}</span>
                    <StatusBadge status={po.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-[1.5px] border-[#231F16] bg-[#F4EFE3]">
            <div className="flex justify-between items-center px-5 py-4 border-b-[1.5px] border-[#231F16]">
              <h3 className="font-['Fraunces'] font-semibold text-[16px]">Recent Quotations</h3>
              <Link to="/quotations" className="font-['IBM_Plex_Mono'] text-[11.5px] text-[#8A3223] hover:underline">View all →</Link>
            </div>
            
            {(!data.recentQuotations || data.recentQuotations.length === 0) ? (
              <div className="p-6 text-center font-['IBM_Plex_Mono'] text-sm text-[#6b6349]">No recent quotations.</div>
            ) : (
              <div>
                {data.recentQuotations.map((qt, idx) => (
                  <div key={idx} className="flex justify-between items-center px-5 py-3.5 border-b border-[#C9C0A8] last:border-0">
                    <div>
                      <h4 className="font-semibold text-[13.5px] mb-1">QT for {qt.rfqId}</h4>
                      <span className="font-['IBM_Plex_Mono'] text-[11px] text-[#6b6349]">₹{qt.totalAmount?.toLocaleString('en-IN')}</span>
                    </div>
                    <StatusBadge status={qt.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      );
    }
    return null;
  };

  return (
    <motion.div 
      className="p-9"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {renderStats()}
      {renderLists()}

      {/* Quick Actions (only for non-vendors) */}
      {role !== 'VENDOR' && (
        <motion.div variants={itemVariants} className="border-[1.5px] border-[#231F16] bg-[#F4EFE3]">
          <div className="px-5 py-4 border-b-[1.5px] border-[#231F16]">
            <h3 className="font-['Fraunces'] font-semibold text-[16px]">Quick actions</h3>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
              <QuickAction label="+ Create RFQ" to="/rfqs/new" />
              <QuickAction label="+ Register vendor" to="/vendors/new" />
              <QuickAction label="↗ Compare quotations" to="/quotations" />
              <QuickAction label="↗ Generate report" to="/reports" />
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

// -- Helpers --

const StatCard = ({ title, value, isLarge }) => (
  <motion.div 
    whileHover={{ y: -2 }}
    className="border-[1.5px] border-[#231F16] bg-[#F4EFE3] p-5"
  >
    <div className="font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-wide text-[#6b6349] mb-3">{title}</div>
    <div className={`font-['Fraunces'] font-semibold text-[32px] ${isLarge ? "font-['IBM_Plex_Mono'] text-[26px]" : ""}`}>{value}</div>
  </motion.div>
);

const QuickAction = ({ label, to }) => (
  <Link to={to}>
    <motion.div 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="border-[1.5px] border-dashed border-[#C9C0A8] p-5 text-center font-['IBM_Plex_Mono'] text-[12.5px] text-[#4A4535] cursor-pointer hover:border-[#8A3223] hover:text-[#8A3223] transition-colors"
    >
      {label}
    </motion.div>
  </Link>
);

const StatusBadge = ({ status }) => {
  let bg = "bg-[rgba(35,31,22,0.08)]";
  let color = "text-[#4A4535]";
  
  if (['APPROVED', 'AWARDED', 'PAID'].includes(status)) {
    bg = "bg-[rgba(75,107,74,0.15)]";
    color = "text-[#4B6B4A]";
  } else if (['PENDING', 'OVERDUE'].includes(status)) {
    bg = "bg-[rgba(138,50,35,0.12)]";
    color = "text-[#8A3223]";
  } else if (['ISSUED', 'PUBLISHED', 'SENT'].includes(status)) {
    bg = "bg-[rgba(156,122,46,0.15)]";
    color = "text-[#9C7A2E]";
  }

  return (
    <span className={`font-['IBM_Plex_Mono'] text-[10.5px] uppercase px-2 py-0.5 rounded-full inline-block tracking-wide ${bg} ${color}`}>
      {status || 'UNKNOWN'}
    </span>
  );
};

export default DashboardPage;
