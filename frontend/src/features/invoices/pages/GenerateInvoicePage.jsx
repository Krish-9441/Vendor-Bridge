import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePurchaseOrderById } from '../../purchaseOrders/api/purchaseOrderHooks';
import { useInvoices, useGenerateInvoice } from '../api/invoiceHooks';
import { Loader2 } from 'lucide-react';
import useAuthStore from '../../../store/useAuthStore';

const GenerateInvoicePage = () => {
  const { poId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data: poResponse, isPending: poLoading } = usePurchaseOrderById(poId);
  const { data: invoicesResponse } = useInvoices({ limit: 100 });
  const { mutateAsync: generateInvoice, isPending: isGenerating } = useGenerateInvoice();

  const [taxRate, setTaxRate] = useState('18');
  const [error, setError] = useState('');

  const po = poResponse?.data;
  const allInvoices = invoicesResponse?.data?.invoices || [];
  const existingInvoice = allInvoices.find(
    (inv) => inv.purchaseOrderId?._id === poId || inv.purchaseOrderId === poId
  );

  if (poLoading) return (
    <div className="flex-1 flex items-center justify-center">
      <Loader2 className="animate-spin text-[#8A3223] w-8 h-8" />
    </div>
  );

  if (!po) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const rate = parseFloat(taxRate);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      setError('Tax rate must be between 0 and 100');
      return;
    }
    try {
      const res = await generateInvoice({ purchaseOrderId: poId, taxRate: rate });
      navigate(`/invoices/${res.data._id}`);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to generate invoice');
    }
  };

  const subtotal = po.totalAmount || 0;
  const rate = parseFloat(taxRate) || 0;
  const taxAmt = Math.round((subtotal * rate) / 100);
  const total = subtotal + taxAmt;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col min-w-0">
      <div className="flex justify-between items-center px-9 py-5 border-b-[1.5px] border-[#231F16] bg-[#EDE6D6]">
        <div>
          <h1 className="font-['Fraunces'] font-semibold text-[22px] text-[#231F16]">Generate Invoice</h1>
          <div className="font-['IBM_Plex_Mono'] text-[11.5px] text-[#6b6349] mt-1 uppercase tracking-wide">
            For {po.poNumber} &middot; {po.rfqId?.title || 'Purchase Order'}
          </div>
        </div>
        <Link to="/purchase-orders" className="font-['IBM_Plex_Mono'] text-[12.5px] text-[#8A3223] hover:underline">← Back to POs</Link>
      </div>

      <div className="p-9 max-w-2xl">
        {existingInvoice ? (
          <div className="border-[1.5px] border-[#4B6B4A] bg-[#F4EFE3] p-6">
            <div className="font-['IBM_Plex_Mono'] text-[11px] uppercase text-[#4B6B4A] mb-2">Invoice Already Generated</div>
            <div className="text-[14px] text-[#231F16] mb-4">
              An invoice ({existingInvoice.invoiceNumber}) was already created for this PO.
            </div>
            <Link
              to={`/invoices/${existingInvoice._id}`}
              className="inline-block px-4 py-2.5 border-[1.5px] border-[#231F16] bg-[#231F16] text-[#EDE6D6] font-['IBM_Plex_Mono'] text-[12px] hover:bg-[#8A3223] hover:border-[#8A3223] transition-colors"
            >
              View Invoice →
            </Link>
          </div>
        ) : po.status !== 'ACKNOWLEDGED' ? (
          <div className="border-[1.5px] border-[#C9C0A8] bg-[#F4EFE3] p-6">
            <div className="font-['IBM_Plex_Mono'] text-[11px] uppercase text-[#9C7A2E] mb-2">PO Not Yet Acknowledged</div>
            <div className="text-[13.5px] text-[#4A4535]">
              You need to acknowledge the Purchase Order before generating an invoice. Current status: <b>{po.status}</b>.
            </div>
          </div>
        ) : (
          <div className="border-[1.5px] border-[#231F16] bg-[#F4EFE3]">
            <div className="px-6 py-4 border-b-[1.5px] border-[#231F16]">
              <h3 className="font-['Fraunces'] font-semibold text-[16.5px] text-[#231F16]">Invoice Summary</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3 mb-6">
                <div className="flex justify-between py-2.5 border-b border-[#C9C0A8] text-[13.5px]">
                  <span className="text-[#6b6349] font-['IBM_Plex_Mono'] text-[11px] uppercase">PO Number</span>
                  <span className="font-semibold text-[#231F16]">{po.poNumber}</span>
                </div>
                <div className="flex justify-between py-2.5 border-b border-[#C9C0A8] text-[13.5px]">
                  <span className="text-[#6b6349] font-['IBM_Plex_Mono'] text-[11px] uppercase">Subtotal</span>
                  <span className="font-['IBM_Plex_Mono'] text-[#231F16]">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-5">
                  <label className="block font-['IBM_Plex_Mono'] text-[11px] uppercase text-[#4A4535] mb-2">
                    Tax Rate (GST %)
                  </label>
                  <div className="flex gap-2 flex-wrap mb-2">
                    {['0', '5', '12', '18', '28'].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setTaxRate(r)}
                        className={`px-3 py-1.5 border-[1.5px] font-['IBM_Plex_Mono'] text-[12px] rounded-full transition-colors ${
                          taxRate === r
                            ? 'border-[#8A3223] text-[#8A3223] bg-[#EDE6D6]'
                            : 'border-[#C9C0A8] text-[#6b6349] hover:bg-[#EDE6D6]'
                        }`}
                      >
                        {r}%
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                    className="w-full p-3 border-[1.5px] border-[#C9C0A8] bg-[#EDE6D6] font-['IBM_Plex_Mono'] text-[13.5px] focus:outline-none focus:border-[#8A3223]"
                    placeholder="e.g. 18"
                  />
                </div>

                {/* Live Preview */}
                <div className="bg-[#EDE6D6] p-4 mb-5 space-y-1.5">
                  <div className="flex justify-between text-[13px] text-[#4A4535]">
                    <span className="font-['IBM_Plex_Mono'] text-[11px] uppercase">Subtotal</span>
                    <span className="font-['IBM_Plex_Mono']">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-[13px] text-[#4A4535]">
                    <span className="font-['IBM_Plex_Mono'] text-[11px] uppercase">Tax ({rate}%)</span>
                    <span className="font-['IBM_Plex_Mono']">₹{taxAmt.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-[16px] font-semibold text-[#231F16] pt-2 border-t border-[#C9C0A8]">
                    <span className="font-['IBM_Plex_Mono'] text-[12px] uppercase">Total</span>
                    <span className="font-['IBM_Plex_Mono'] text-[#8A3223]">₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 border border-[#8A3223] text-[#8A3223] font-['IBM_Plex_Mono'] text-[12px]">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full py-3.5 border-[1.5px] border-[#231F16] bg-[#231F16] text-[#EDE6D6] font-['IBM_Plex_Mono'] text-[13px] hover:bg-[#8A3223] hover:border-[#8A3223] transition-colors disabled:opacity-50"
                >
                  {isGenerating ? 'Generating Invoice...' : 'Generate Invoice'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default GenerateInvoicePage;
