import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useInvoiceById, useSendInvoiceEmail, useUpdateInvoiceStatus } from '../api/invoiceHooks';
import { axiosInstance } from '../../../lib/axios';
import useAuthStore from '../../../store/useAuthStore';
import { Loader2, X } from 'lucide-react';

// ── Status Badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  let bg = "bg-[rgba(35,31,22,0.08)]"; let color = "text-[#4A4535]";
  if (status === 'PAID') { bg = "bg-[rgba(75,107,74,0.15)]"; color = "text-[#4B6B4A]"; }
  else if (status === 'SENT') { bg = "bg-[rgba(156,122,46,0.16)]"; color = "text-[#9C7A2E]"; }
  else if (status === 'GENERATED') { bg = "bg-[rgba(100,120,200,0.12)]"; color = "text-[#4A5B9A]"; }
  return (
    <span className={`font-['IBM_Plex_Mono'] text-[10.5px] uppercase px-3 py-1 rounded-full inline-block tracking-wide whitespace-nowrap ${bg} ${color}`}>
      {status || 'UNKNOWN'}
    </span>
  );
};

// ── Email Confirmation Modal ──────────────────────────────────────────────────
const EmailModal = ({ invoice, onClose, onSend, isSending, previewUrl }) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#F4EFE3] border-[1.5px] border-[#231F16] w-full max-w-md"
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#C9C0A8]">
          <h3 className="font-['Fraunces'] font-semibold text-[17px] text-[#231F16]">Send Invoice via Email</h3>
          <button onClick={onClose} className="text-[#6b6349] hover:text-[#231F16]"><X size={18} /></button>
        </div>

        {previewUrl ? (
          <div className="p-6">
            <div className="mb-4 p-4 bg-[#EDE6D6] border border-[#4B6B4A] text-[#4B6B4A] rounded-sm">
              <div className="font-['IBM_Plex_Mono'] text-[11px] uppercase mb-1">Email Sent Successfully</div>
              <div className="text-[13px]">Invoice emailed to the procurement team.</div>
            </div>
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center py-3 border-[1.5px] border-[#8A3223] text-[#8A3223] font-['IBM_Plex_Mono'] text-[12px] hover:bg-[#8A3223] hover:text-white transition-colors"
            >
              ↗ View Email Preview (Ethereal)
            </a>
            <button onClick={onClose} className="w-full mt-3 py-3 bg-[#231F16] text-[#EDE6D6] font-['IBM_Plex_Mono'] text-[12px] hover:bg-[#8A3223] transition-colors">
              Close
            </button>
          </div>
        ) : (
          <div className="p-6">
            <div className="space-y-3 mb-6">
              <div className="flex justify-between py-2 border-b border-[#C9C0A8] text-[13.5px]">
                <span className="text-[#6b6349] font-['IBM_Plex_Mono'] text-[11px] uppercase">Invoice</span>
                <span className="font-semibold text-[#231F16]">{invoice?.invoiceNumber}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#C9C0A8] text-[13.5px]">
                <span className="text-[#6b6349] font-['IBM_Plex_Mono'] text-[11px] uppercase">Amount</span>
                <span className="font-['IBM_Plex_Mono'] text-[#8A3223]">₹{invoice?.totalAmount?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-2 text-[13.5px]">
                <span className="text-[#6b6349] font-['IBM_Plex_Mono'] text-[11px] uppercase">Recipient</span>
                <span className="text-[#231F16]">accounts@vendorbridge.com</span>
              </div>
            </div>
            <div className="p-3 mb-5 bg-[#EDE6D6] border border-[#C9C0A8] text-[12.5px] text-[#4A4535] font-['IBM_Plex_Mono']">
              The invoice PDF will be attached and emailed automatically.
            </div>
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-3 border-[1.5px] border-[#C9C0A8] text-[#6b6349] font-['IBM_Plex_Mono'] text-[12px] hover:bg-[#EDE6D6] transition-colors">
                Cancel
              </button>
              <button
                onClick={onSend}
                disabled={isSending}
                className="flex-1 py-3 border-[1.5px] border-[#231F16] bg-[#231F16] text-[#EDE6D6] font-['IBM_Plex_Mono'] text-[12px] hover:bg-[#8A3223] hover:border-[#8A3223] transition-colors disabled:opacity-50"
              >
                {isSending ? 'Sending...' : '✉ Send Invoice'}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
const InvoiceDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data: response, isPending, isError, error } = useInvoiceById(id);
  const { mutateAsync: sendEmail, isPending: isSending } = useSendInvoiceEmail();
  const { mutateAsync: markPaid, isPending: isMarkingPaid } = useUpdateInvoiceStatus();

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  if (isPending) return (
    <div className="flex-1 flex items-center justify-center">
      <Loader2 className="animate-spin text-[#8A3223] w-8 h-8" />
    </div>
  );

  if (isError) return (
    <div className="p-9">
      <div className="p-4 border border-[#8A3223] bg-[#F4EFE3] text-[#8A3223] rounded-sm font-['IBM_Plex_Mono'] text-[13px]">
        Failed to load invoice: {error?.response?.data?.message || error.message}
      </div>
      <button onClick={() => navigate('/invoices')} className="mt-4 font-['IBM_Plex_Mono'] text-[12.5px] text-[#8A3223] hover:underline">← Back</button>
    </div>
  );

  const inv = response?.data;
  if (!inv) return null;

  const po = inv.purchaseOrderId;
  const vendor = inv.vendorId;
  const isVendor = user?.role === 'VENDOR';
  const isManagerOrAdmin = user?.role === 'MANAGER' || user?.role === 'ADMIN';

  const handleDownload = async () => {
    try {
      const res = await axiosInstance.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${inv.invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert('Failed to download PDF');
    }
  };

  const handlePrint = () => window.print();

  const handleSendEmail = async () => {
    try {
      const res = await sendEmail(id);
      setPreviewUrl(res?.data?.emailResult?.previewUrl || null);
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to send email');
    }
  };

  const handleMarkPaid = async () => {
    if (window.confirm('Mark this invoice as PAID?')) {
      try {
        await markPaid({ id, status: 'PAID' });
      } catch (err) {
        alert(err?.response?.data?.message || 'Failed to update status');
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col min-w-0">
      {/* Top Bar */}
      <div className="flex justify-between items-center px-9 py-5 border-b-[1.5px] border-[#231F16] bg-[#EDE6D6] flex-wrap gap-4">
        <div>
          <h1 className="font-['Fraunces'] font-semibold text-[22px] text-[#231F16]">Invoice — {inv.invoiceNumber}</h1>
          <div className="font-['IBM_Plex_Mono'] text-[11.5px] text-[#6b6349] mt-1 uppercase tracking-wide">
            Generated from {po?.poNumber || 'PO'} &middot; Status: {inv.status}
          </div>
        </div>
        <div className="flex gap-2.5 flex-wrap">
          <button
            onClick={handleDownload}
            className="px-4 py-2 border-[1.5px] border-[#231F16] font-['IBM_Plex_Mono'] text-[12px] bg-transparent hover:bg-[#231F16] hover:text-[#EDE6D6] transition-colors"
          >
            ⬇ Download PDF
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 border-[1.5px] border-[#C9C0A8] font-['IBM_Plex_Mono'] text-[12px] bg-transparent hover:bg-[#EDE6D6] transition-colors"
          >
            🖨 Print
          </button>
          {isVendor && inv.status !== 'PAID' && (
            <button
              onClick={() => { setPreviewUrl(null); setShowEmailModal(true); }}
              disabled={isSending}
              className="px-4 py-2 border-[1.5px] border-[#231F16] bg-[#231F16] text-[#EDE6D6] font-['IBM_Plex_Mono'] text-[12px] hover:bg-[#8A3223] hover:border-[#8A3223] transition-colors"
            >
              ✉ Send via email
            </button>
          )}
          {isManagerOrAdmin && inv.status !== 'PAID' && (
            <button
              onClick={handleMarkPaid}
              disabled={isMarkingPaid}
              className="px-4 py-2 border-[1.5px] border-[#4B6B4A] bg-[#4B6B4A] text-white font-['IBM_Plex_Mono'] text-[12px] hover:bg-[#3d573c] transition-colors disabled:opacity-50"
            >
              {isMarkingPaid ? 'Updating...' : '✓ Mark as Paid'}
            </button>
          )}
          <button onClick={() => navigate('/invoices')} className="px-4 py-2 border-[1.5px] border-[#C9C0A8] font-['IBM_Plex_Mono'] text-[12px] bg-transparent hover:bg-[#EDE6D6] transition-colors">
            Back
          </button>
        </div>
      </div>

      {/* Document Viewer */}
      <div className="p-9 flex justify-center pb-20">
        <div className="w-full max-w-[820px] bg-[#F4EFE3] border-[1.5px] border-[#231F16] px-14 py-12 relative shadow-sm">

          {/* Status Stamp */}
          {inv.status === 'PAID' && (
            <div className="absolute top-11 right-14 w-24 h-24 border-[2.5px] border-[#4B6B4A] rounded-full text-[#4B6B4A] flex items-center justify-center text-center font-['IBM_Plex_Mono'] font-semibold text-[10px] -rotate-12 tracking-wider uppercase leading-tight">
              PAYMENT<br />APPROVED
            </div>
          )}
          {inv.status === 'SENT' && (
            <div className="absolute top-11 right-14 w-24 h-24 border-[2.5px] border-[#9C7A2E] rounded-full text-[#9C7A2E] flex items-center justify-center text-center font-['IBM_Plex_Mono'] font-semibold text-[10px] -rotate-12 tracking-wider uppercase leading-tight">
              AWAITING<br />PAYMENT
            </div>
          )}

          {/* Header */}
          <div className="flex justify-between items-start mb-9 border-b-2 border-[#231F16] pb-6">
            <div>
              <div className="flex items-center gap-2.5 font-['Fraunces'] font-bold text-[18px] mb-4 text-[#231F16]">
                <span className="w-5 h-5 border-2 border-[#8A3223] rounded-full relative flex-shrink-0">
                  <span className="absolute inset-1 border border-[#8A3223] rounded-full" />
                </span>
                VendorBridge
              </div>
              <div className="text-[12.5px] text-[#6b6349] max-w-[220px] leading-relaxed">
                {vendor?.companyName || 'Vendor'}<br />
                {vendor?.contactEmail}<br />
                {vendor?.gstNumber && `GSTIN: ${vendor.gstNumber}`}
              </div>
            </div>
            <div className="text-right">
              <h2 className="font-['Fraunces'] font-semibold text-[26px] mb-1 text-[#231F16]">Invoice</h2>
              <div className="font-['IBM_Plex_Mono'] text-[13px] text-[#8A3223]">{inv.invoiceNumber}</div>
              <div className="font-['IBM_Plex_Mono'] text-[11.5px] text-[#6b6349] mt-1">
                Issued {new Date(inv.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Meta Grid */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <h5 className="font-['IBM_Plex_Mono'] text-[10.5px] uppercase text-[#6b6349] mb-2 tracking-wide">Billed to (Vendor)</h5>
              <p className="text-[13.5px] leading-relaxed text-[#231F16]">
                <b className="block text-[14.5px] mb-0.5">{vendor?.companyName}</b>
                {vendor?.contactEmail}<br />
                {vendor?.gstNumber && `GSTIN: ${vendor.gstNumber}`}
              </p>
            </div>
            <div>
              <h5 className="font-['IBM_Plex_Mono'] text-[10.5px] uppercase text-[#6b6349] mb-2 tracking-wide">Reference</h5>
              <p className="text-[13.5px] leading-relaxed text-[#231F16]">
                <b className="block mb-0.5">{po?.poNumber}</b>
                {po?.rfqId?.rfqNumber && `RFQ: ${po.rfqId.rfqNumber}`}
                {po?.rfqId?.title && <br />}
                {po?.rfqId?.title}
              </p>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full border-collapse mb-6">
            <thead>
              <tr>
                <th className="text-left font-['IBM_Plex_Mono'] text-[10.5px] uppercase text-[#6b6349] py-2.5 px-1 border-b-[1.5px] border-[#231F16]">Description</th>
                <th className="text-right font-['IBM_Plex_Mono'] text-[10.5px] uppercase text-[#6b6349] py-2.5 px-1 border-b-[1.5px] border-[#231F16]">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-3 px-1 border-b border-[#C9C0A8] text-[13.5px] text-[#231F16]">
                  Services / Goods per {po?.poNumber || 'Purchase Order'}
                </td>
                <td className="py-3 px-1 border-b border-[#C9C0A8] text-[13.5px] text-right font-['IBM_Plex_Mono'] text-[#231F16]">
                  ₹{inv.subtotal?.toLocaleString('en-IN')}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-10">
            <table className="w-[280px] border-collapse">
              <tbody>
                <tr>
                  <td className="py-1.5 px-1 text-[13.5px] text-[#6b6349]">Subtotal</td>
                  <td className="py-1.5 px-1 text-[13.5px] text-right font-['IBM_Plex_Mono'] text-[#231F16]">₹{inv.subtotal?.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-1 text-[13.5px] text-[#6b6349]">GST / Tax ({inv.taxRate}%)</td>
                  <td className="py-1.5 px-1 text-[13.5px] text-right font-['IBM_Plex_Mono'] text-[#231F16]">₹{inv.taxAmount?.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td className="py-3 px-1 text-[17px] font-semibold text-[#231F16] border-t-[1.5px] border-[#231F16]">Total due</td>
                  <td className="py-3 px-1 text-[17px] text-right font-['IBM_Plex_Mono'] text-[#8A3223] font-semibold border-t-[1.5px] border-[#231F16]">₹{inv.totalAmount?.toLocaleString('en-IN')}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Status Display */}
          <div className="flex items-center gap-3 mb-6">
            <span className="font-['IBM_Plex_Mono'] text-[11px] uppercase text-[#6b6349]">Status:</span>
            <StatusBadge status={inv.status} />
            {inv.sentAt && (
              <span className="font-['IBM_Plex_Mono'] text-[11px] text-[#6b6349]">Sent {new Date(inv.sentAt).toLocaleDateString()}</span>
            )}
          </div>

          {/* Footer */}
          <div className="pt-5 border-t border-[#C9C0A8] flex justify-between font-['IBM_Plex_Mono'] text-[11.5px] text-[#6b6349]">
            <span>Generated automatically from {po?.poNumber || 'PO'} · VendorBridge ERP</span>
            <span>Page 1 of 1</span>
          </div>

        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <EmailModal
          invoice={inv}
          onClose={() => setShowEmailModal(false)}
          onSend={handleSendEmail}
          isSending={isSending}
          previewUrl={previewUrl}
        />
      )}
    </motion.div>
  );
};

export default InvoiceDetailsPage;
