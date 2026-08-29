import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './features/landing/pages/LandingPage';
import LoginPage from './features/auth/pages/LoginPage';
import SignupPage from './features/auth/pages/SignupPage';
import ForgotPasswordPage from './features/auth/pages/ForgotPasswordPage';
import ProtectedRoute from './components/shared/ProtectedRoute';
import RoleRoute from './components/shared/RoleRoute';
import AppLayout from './components/layout/AppLayout';
import DashboardPage from './features/dashboard/pages/DashboardPage';
import VendorsPage from './features/vendors/pages/VendorsPage';
import RegisterVendorPage from './features/vendors/pages/RegisterVendorPage';
import VendorDetailsPage from './features/vendors/pages/VendorDetailsPage';
import RfqsPage from './features/rfq/pages/RfqsPage';
import CreateRfqPage from './features/rfq/pages/CreateRfqPage';
import RfqDetailsPage from './features/rfq/pages/RfqDetailsPage';
import CompareQuotationsPage from './features/rfq/pages/CompareQuotationsPage';
import QuotationsPage from './features/quotations/pages/QuotationsPage';
import SubmitQuotationPage from './features/quotations/pages/SubmitQuotationPage';
import ApprovalsPage from './features/approvals/pages/ApprovalsPage';
import ApprovalDetailsPage from './features/approvals/pages/ApprovalDetailsPage';
import PurchaseOrdersPage from './features/purchaseOrders/pages/PurchaseOrdersPage';
import PurchaseOrderDetailsPage from './features/purchaseOrders/pages/PurchaseOrderDetailsPage';
import InvoicesPage from './features/invoices/pages/InvoicesPage';
import InvoiceDetailsPage from './features/invoices/pages/InvoiceDetailsPage';
import GenerateInvoicePage from './features/invoices/pages/GenerateInvoicePage';
import ActivityLogsPage from './features/notifications/pages/ActivityLogsPage';
import ReportsPage from './features/reports/pages/ReportsPage';
function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      
      {/* Protected Routes using AppLayout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          
          {/* RFQ Routes - All authenticated users can view list and details */}
          <Route path="/rfqs" element={<RfqsPage />} />
          <Route path="/rfqs/:id" element={<RfqDetailsPage />} />
          
          {/* Compare Quotations - Only Admins, Managers, POs */}
          <Route element={<RoleRoute allowedRoles={['ADMIN', 'MANAGER', 'PROCUREMENT_OFFICER']} />}>
            <Route path="/rfqs/:id/compare" element={<CompareQuotationsPage />} />
          </Route>
          
          {/* Quotations Routes - Viewable by all */}
          <Route path="/quotations" element={<QuotationsPage />} />
          
          {/* Approvals Routes - Only Admins, Managers, POs */}
          <Route element={<RoleRoute allowedRoles={['ADMIN', 'MANAGER', 'PROCUREMENT_OFFICER']} />}>
            <Route path="/approvals" element={<ApprovalsPage />} />
            <Route path="/approvals/:id" element={<ApprovalDetailsPage />} />
          </Route>
          
          <Route path="/activity-logs" element={<ActivityLogsPage />} />
          
          {/* Purchase Orders Routes - Viewable by all */}
          <Route path="/purchase-orders" element={<PurchaseOrdersPage />} />
          <Route path="/purchase-orders/:id" element={<PurchaseOrderDetailsPage />} />

          {/* Reports Routes - Only Admins, Managers, POs */}
          <Route element={<RoleRoute allowedRoles={['ADMIN', 'MANAGER', 'PROCUREMENT_OFFICER']} />}>
            <Route path="/reports" element={<ReportsPage />} />
          </Route>

          {/* Invoices Routes - Viewable by all */}
          <Route path="/invoices" element={<InvoicesPage />} />
          <Route path="/invoices/:id" element={<InvoiceDetailsPage />} />

          {/* Generate Invoice - Only Vendors */}
          <Route element={<RoleRoute allowedRoles={['VENDOR']} />}>
            <Route path="/purchase-orders/:poId/generate-invoice" element={<GenerateInvoicePage />} />
          </Route>
          
          {/* Submit Quotation - Only Vendors */}
          <Route element={<RoleRoute allowedRoles={['VENDOR']} />}>
            <Route path="/rfqs/:rfqId/quote" element={<SubmitQuotationPage />} />
          </Route>
          
          {/* Create RFQ - Only Admins, Managers, POs */}
          <Route element={<RoleRoute allowedRoles={['ADMIN', 'MANAGER', 'PROCUREMENT_OFFICER']} />}>
            <Route path="/rfqs/new" element={<CreateRfqPage />} />
          </Route>

          {/* Vendor Directory Routes - Only Admins, Managers, and POs can access vendor directory */}
          <Route element={<RoleRoute allowedRoles={['ADMIN', 'MANAGER', 'PROCUREMENT_OFFICER']} />}>
            <Route path="/vendors" element={<VendorsPage />} />
            <Route path="/vendors/new" element={<RegisterVendorPage />} />
            <Route path="/vendors/:id" element={<VendorDetailsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
