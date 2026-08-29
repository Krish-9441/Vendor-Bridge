import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useInvoices } from '../api/invoiceHooks';
import { Loader2 } from 'lucide-react';
import useAuthStore from '../../../store/useAuthStore';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const StatusBadge = ({ status }) => {
  let bg = "bg-[rgba(35,31,22,0.08)]";
  let color = "text-[#4A4535]";
  if (status === 'PAID') { bg = "bg-[rgba(75,107,74,0.15)]"; color = "text-[#4B6B4A]"; }
  else if (status === 'SENT') { bg = "bg-[rgba(156,122,46,0.16)]"; color = "text-[#9C7A2E]"; }
  else if (status === 'GENERATED') { bg = "bg-[rgba(100,120,200,0.12)]"; color = "text-[#4A5B9A]"; }
  return (
    <span className={`font-['IBM_Plex_Mono'] text-[10.5px] uppercase px-3 py-1 rounded-full inline-block tracking-wide whitespace-nowrap ${bg} ${color}`}>
      {status || 'UNKNOWN'}
    </span>
  );
};

const InvoicesPage = () => {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const { user } = useAuthStore();

  const { data: response, isPending, isError, error } = useInvoices({
    status: status || undefined,
    page,
    limit: 10,
  });

  const handleStatusChange = (s) => { setStatus(s); setPage(1); };

  const invoices = response?.data?.invoices || [];
  const meta = response?.data?.pagination || { total: 0, page: 1, pages: 1 };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="flex justify-between items-center px-9 py-5 border-b-[1.5px] border-[#231F16] bg-[#EDE6D6]">
        <div>
          <h1 className="font-['Fraunces'] font-semibold text-[22px] text-[#231F16]">Invoices</h1>
          <div className="font-['IBM_Plex_Mono'] text-[11.5px] text-[#6b6349] mt-1 tracking-wide uppercase">
            {meta.total} Invoices Found
          </div>
        </div>
        {/* Vendors can generate invoices from PO detail page */}
        {user?.role === 'VENDOR' && (
          <Link
            to="/purchase-orders"
            className="px-4 py-2.5 border-[1.5px] border-[#231F16] bg-[#231F16] text-[#EDE6D6] font-['IBM_Plex_Mono'] text-[12px] hover:bg-[#8A3223] hover:border-[#8A3223] transition-colors"
          >
            + Generate from PO
          </Link>
        )}
      </div>

      <div className="p-9 flex-1">
        {/* Status Filters */}
        <div className="flex gap-2.5 flex-wrap mb-5">
          {['', 'GENERATED', 'SENT', 'PAID'].map((s) => (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
              className={`border-[1.5px] px-3.5 py-2 font-['IBM_Plex_Mono'] text-[12px] rounded-full transition-colors ${
                status === s
                  ? 'border-[#8A3223] text-[#8A3223] bg-[#F4EFE3]'
                  : 'border-[#C9C0A8] text-[#6b6349] hover:bg-[#F4EFE3]'
              }`}
            >
              {s === '' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {isPending ? (
          <div className="flex justify-center p-12">
            <Loader2 className="animate-spin text-[#8A3223] w-8 h-8" />
          </div>
        ) : isError ? (
          <div className="p-4 border border-[#8A3223] bg-[#F4EFE3] text-[#8A3223] rounded-sm font-['IBM_Plex_Mono'] text-sm">
            Error: {error?.response?.data?.message || error.message}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border-[1.5px] border-[#231F16] bg-[#F4EFE3]">
              <thead>
                <tr className="bg-[#E4DBC7]">
                  {['Invoice No.', 'Vendor', 'PO Ref', 'Subtotal', 'Tax', 'Total', 'Status', ''].map((h) => (
                    <th key={h} className="text-left px-4 py-4 font-['IBM_Plex_Mono'] text-[10.5px] uppercase tracking-wide text-[#6b6349] border-b-[1.5px] border-[#231F16]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <motion.tbody variants={containerVariants} initial="hidden" animate="visible">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center font-['IBM_Plex_Mono'] text-sm text-[#6b6349]">
                      No invoices found.
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <motion.tr
                      key={inv._id}
                      variants={rowVariants}
                      className="hover:bg-[#E4DBC7] transition-colors border-b border-[#C9C0A8] last:border-0"
                    >
                      <td className="px-4 py-4 font-['IBM_Plex_Mono'] text-[13px] text-[#231F16] font-semibold whitespace-nowrap">
                        {inv.invoiceNumber}
                      </td>
                      <td className="px-4 py-4 text-[13.5px] text-[#231F16]">
                        {inv.vendorId?.companyName || '—'}
                      </td>
                      <td className="px-4 py-4 font-['IBM_Plex_Mono'] text-[12.5px] text-[#4A4535]">
                        {inv.purchaseOrderId?.poNumber || '—'}
                      </td>
                      <td className="px-4 py-4 font-['IBM_Plex_Mono'] text-[13px] text-[#4A4535]">
                        ₹{inv.subtotal?.toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-4 font-['IBM_Plex_Mono'] text-[13px] text-[#4A4535]">
                        {inv.taxRate}%
                      </td>
                      <td className="px-4 py-4 font-['IBM_Plex_Mono'] text-[13px] text-[#8A3223] font-semibold">
                        ₹{inv.totalAmount?.toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-4"><StatusBadge status={inv.status} /></td>
                      <td className="px-4 py-4 text-right whitespace-nowrap">
                        <Link to={`/invoices/${inv._id}`} className="font-['IBM_Plex_Mono'] text-[11.5px] text-[#8A3223] hover:underline">
                          View →
                        </Link>
                      </td>
                    </motion.tr>
                  ))
                )}
              </motion.tbody>
            </table>
          </div>
        )}

        {meta.pages > 1 && (
          <div className="flex justify-between items-center mt-6 font-['IBM_Plex_Mono'] text-[12px] text-[#6b6349]">
            <span>Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, meta.total)} of {meta.total}</span>
            <div className="flex gap-4">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="hover:text-[#8A3223] disabled:opacity-50">← Prev</button>
              <span>Page {page} of {meta.pages}</span>
              <button disabled={page === meta.pages} onClick={() => setPage(p => p + 1)} className="hover:text-[#8A3223] disabled:opacity-50">Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoicesPage;
