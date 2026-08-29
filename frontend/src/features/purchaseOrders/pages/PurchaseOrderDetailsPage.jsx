import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePurchaseOrderById, useUpdatePoStatus } from '../api/purchaseOrderHooks';
import { useInvoices } from '../../invoices/api/invoiceHooks';
import { axiosInstance } from '../../../lib/axios';
import useAuthStore from '../../../store/useAuthStore';
import { Loader2 } from 'lucide-react';

const PurchaseOrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const { data: response, isPending, isError, error } = usePurchaseOrderById(id);
  const { mutateAsync: updateStatus, isPending: isUpdating } = useUpdatePoStatus();
  const { data: invoicesResponse } = useInvoices({ limit: 100 });
  const allInvoices = invoicesResponse?.data?.invoices || [];
  const existingInvoice = allInvoices.find(
    (inv) => inv.purchaseOrderId?._id === id || inv.purchaseOrderId === id
  );

  if (isPending) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="animate-spin text-[#8A3223] w-8 h-8" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-9">
        <div className="p-4 border border-[#8A3223] bg-[#F4EFE3] text-[#8A3223] rounded-sm font-['IBM_Plex_Mono'] text-[13px]">
          Failed to load Purchase Order: {error?.response?.data?.message || error.message}
        </div>
        <button onClick={() => navigate('/purchase-orders')} className="mt-4 font-['IBM_Plex_Mono'] text-[12.5px] text-[#8A3223] hover:underline">
          ← Back to POs
        </button>
      </div>
    );
  }

  const po = response?.data;
  if (!po) return null;

  const { rfqId: rfq, vendorId: vendor, quotationId: quotation, approvalId: approval, issuedBy } = po;

  const handleDownload = async () => {
    try {
      const res = await axiosInstance.get(`/purchase-orders/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${po.poNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download PDF');
    }
  };

  const handleAcknowledge = async () => {
    if (window.confirm('Are you sure you want to acknowledge this Purchase Order?')) {
      try {
        await updateStatus({ id, status: 'ACKNOWLEDGED' });
        alert('Purchase Order acknowledged successfully.');
      } catch (err) {
        alert(err?.response?.data?.message || 'Failed to acknowledge');
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="flex-1 flex flex-col min-w-0"
    >
      <div className="flex justify-between items-center px-9 py-5 border-b-[1.5px] border-[#231F16] bg-[#EDE6D6] flex-wrap gap-4">
        <div>
          <h1 className="font-['Fraunces'] font-semibold text-[22px] text-[#231F16]">Purchase Order — {po.poNumber}</h1>
          <div className="font-['IBM_Plex_Mono'] text-[11.5px] text-[#6b6349] mt-1 tracking-wide uppercase">
            {rfq?.rfqNumber} &middot; STATUS: {po.status}
          </div>
        </div>
        <div className="flex gap-2.5">
          <button 
            onClick={handleDownload}
            className="px-4 py-2 border-[1.5px] border-[#231F16] font-['IBM_Plex_Mono'] text-[12px] cursor-pointer bg-transparent hover:bg-[#8A3223] hover:border-[#8A3223] hover:text-white transition-colors"
          >
            ⬇ Download PDF
          </button>
          
          {user?.role === 'VENDOR' && po.status === 'ISSUED' && (
            <button 
              onClick={handleAcknowledge}
              disabled={isUpdating}
              className="px-4 py-2 border-[1.5px] border-[#4B6B4A] bg-[#4B6B4A] text-white font-['IBM_Plex_Mono'] text-[12px] cursor-pointer hover:bg-[#3d573c] transition-colors disabled:opacity-50"
            >
              {isUpdating ? 'Updating...' : 'Acknowledge PO'}
            </button>
          )}

          {user?.role === 'VENDOR' && po.status === 'ACKNOWLEDGED' && (
            existingInvoice ? (
              <Link
                to={`/invoices/${existingInvoice._id}`}
                className="px-4 py-2 border-[1.5px] border-[#4B6B4A] text-[#4B6B4A] font-['IBM_Plex_Mono'] text-[12px] hover:bg-[#4B6B4A] hover:text-white transition-colors inline-block"
              >
                View Invoice →
              </Link>
            ) : (
              <Link
                to={`/purchase-orders/${id}/generate-invoice`}
                className="px-4 py-2 border-[1.5px] border-[#231F16] bg-[#231F16] text-[#EDE6D6] font-['IBM_Plex_Mono'] text-[12px] hover:bg-[#8A3223] hover:border-[#8A3223] transition-colors inline-block"
              >
                + Generate Invoice
              </Link>
            )
          )}

          <button 
            onClick={() => navigate('/purchase-orders')}
            className="px-4 py-2 border-[1.5px] border-[#C9C0A8] font-['IBM_Plex_Mono'] text-[12px] cursor-pointer bg-transparent hover:bg-[#F4EFE3] transition-colors"
          >
            Back
          </button>
        </div>
      </div>

      <div className="p-9 flex justify-center pb-20">
        
        {/* Document Render */}
        <div className="w-full max-w-[820px] bg-[#F4EFE3] border-[1.5px] border-[#231F16] px-14 py-12 relative shadow-sm">
          
          {po.status === 'ACKNOWLEDGED' && (
            <div className="absolute top-11 right-14 w-24 h-24 border-[2.5px] border-[#4B6B4A] rounded-full text-[#4B6B4A] flex items-center justify-center text-center font-['IBM_Plex_Mono'] font-semibold text-[10px] -rotate-12 tracking-wider uppercase">
              ACKNOWLEDGED
            </div>
          )}
          {po.status === 'ISSUED' && (
            <div className="absolute top-11 right-14 w-24 h-24 border-[2.5px] border-[#9C7A2E] rounded-full text-[#9C7A2E] flex items-center justify-center text-center font-['IBM_Plex_Mono'] font-semibold text-[10px] -rotate-12 tracking-wider uppercase">
              ISSUED
            </div>
          )}

          <div className="flex justify-between items-start mb-9 border-b-2 border-[#231F16] pb-6">
            <div>
              <div className="flex items-center gap-2.5 font-['Fraunces'] font-bold text-[18px] mb-4 text-[#231F16]">
                <span className="w-5 h-5 border-2 border-[#8A3223] rounded-full relative">
                  <span className="absolute inset-1 border border-[#8A3223] rounded-full"></span>
                </span>
                VendorBridge
              </div>
              <div className="text-[12.5px] text-[#6b6349] max-w-[220px] leading-relaxed">
                VendorBridge Corporate<br />
                Procurement Division<br />
                Mumbai, MH 400001<br />
              </div>
            </div>
            <div className="text-right">
              <h2 className="font-['Fraunces'] font-semibold text-[26px] mb-1 text-[#231F16]">Purchase Order</h2>
              <div className="font-['IBM_Plex_Mono'] text-[13px] text-[#8A3223]">{po.poNumber}</div>
              <div className="font-['IBM_Plex_Mono'] text-[11.5px] text-[#6b6349] mt-1">Issued {new Date(po.createdAt).toLocaleDateString()}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <h5 className="font-['IBM_Plex_Mono'] text-[10.5px] uppercase text-[#6b6349] mb-2 tracking-wide">Vendor</h5>
              <p className="text-[13.5px] leading-relaxed text-[#231F16]">
                <b className="block text-[14.5px] mb-0.5">{vendor?.companyName}</b>
                {vendor?.contactEmail}<br />
                {vendor?.gstNumber ? `GSTIN: ${vendor.gstNumber}` : ''}
              </p>
            </div>
            <div>
              <h5 className="font-['IBM_Plex_Mono'] text-[10.5px] uppercase text-[#6b6349] mb-2 tracking-wide">Reference</h5>
              <p className="text-[13.5px] leading-relaxed text-[#231F16]">
                <b>RFQ: {rfq?.rfqNumber}</b><br />
                {rfq?.title}<br />
                Issued By: {issuedBy?.name || 'Admin'}
              </p>
            </div>
          </div>

          <table className="w-full border-collapse mb-6">
            <thead>
              <tr>
                <th className="text-left font-['IBM_Plex_Mono'] text-[10.5px] uppercase text-[#6b6349] py-2.5 px-1 border-b-[1.5px] border-[#231F16]">Description</th>
                <th className="text-right font-['IBM_Plex_Mono'] text-[10.5px] uppercase text-[#6b6349] py-2.5 px-1 border-b-[1.5px] border-[#231F16]">Qty</th>
                <th className="text-right font-['IBM_Plex_Mono'] text-[10.5px] uppercase text-[#6b6349] py-2.5 px-1 border-b-[1.5px] border-[#231F16]">Unit Price</th>
                <th className="text-right font-['IBM_Plex_Mono'] text-[10.5px] uppercase text-[#6b6349] py-2.5 px-1 border-b-[1.5px] border-[#231F16]">Amount</th>
              </tr>
            </thead>
            <tbody>
              {/* If RFQ has item details, we map them. For this system, the quotation consolidates total, but we can distribute it if items exist. For simplicity, we just list the total quotation details if items aren't neatly split in quotation model. */}
              {rfq?.itemDetails && rfq.itemDetails.length > 0 ? (
                rfq.itemDetails.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3 px-1 border-b border-[#C9C0A8] text-[13.5px] text-[#231F16]">
                      {item.name}
                    </td>
                    <td className="py-3 px-1 border-b border-[#C9C0A8] text-[13.5px] text-right font-['IBM_Plex_Mono'] text-[#231F16]">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="py-3 px-1 border-b border-[#C9C0A8] text-[13.5px] text-right font-['IBM_Plex_Mono'] text-[#231F16]">
                      -
                    </td>
                    <td className="py-3 px-1 border-b border-[#C9C0A8] text-[13.5px] text-right font-['IBM_Plex_Mono'] text-[#231F16]">
                      -
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-3 px-1 border-b border-[#C9C0A8] text-[13.5px] text-[#231F16]">
                    Bulk Items as per RFQ {rfq?.rfqNumber}
                  </td>
                  <td className="py-3 px-1 border-b border-[#C9C0A8] text-[13.5px] text-right font-['IBM_Plex_Mono'] text-[#231F16]">
                    {quotation?.quantity || 1}
                  </td>
                  <td className="py-3 px-1 border-b border-[#C9C0A8] text-[13.5px] text-right font-['IBM_Plex_Mono'] text-[#231F16]">
                    ₹{quotation?.unitPrice?.toLocaleString('en-IN') || po.totalAmount?.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-1 border-b border-[#C9C0A8] text-[13.5px] text-right font-['IBM_Plex_Mono'] text-[#231F16]">
                    ₹{po.totalAmount?.toLocaleString('en-IN')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="flex justify-end">
            <table className="w-[280px] border-collapse">
              <tbody>
                <tr>
                  <td className="py-1.5 px-1 text-[13.5px] text-[#6b6349]">Subtotal</td>
                  <td className="py-1.5 px-1 text-[13.5px] text-right font-['IBM_Plex_Mono'] text-[#231F16]">₹{po.totalAmount?.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-1 text-[13.5px] text-[#6b6349]">GST (0%)</td>
                  <td className="py-1.5 px-1 text-[13.5px] text-right font-['IBM_Plex_Mono'] text-[#231F16]">₹0</td>
                </tr>
                <tr>
                  <td className="py-3 px-1 text-[17px] font-semibold text-[#231F16] border-t-[1.5px] border-[#231F16] mt-1">Total due</td>
                  <td className="py-3 px-1 text-[17px] font-semibold text-right font-['IBM_Plex_Mono'] text-[#8A3223] border-t-[1.5px] border-[#231F16] mt-1">₹{po.totalAmount?.toLocaleString('en-IN')}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-10 pt-5 border-t border-[#C9C0A8] flex justify-between font-['IBM_Plex_Mono'] text-[11.5px] text-[#6b6349]">
            <span>Generated automatically from {approval?._id || 'Approval'} &middot; VendorBridge ERP</span>
            <span>Page 1 of 1</span>
          </div>

        </div>

      </div>
    </motion.div>
  );
};

export default PurchaseOrderDetailsPage;
