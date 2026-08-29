import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { useCreateQuotation } from '../api/quotationHooks';
import { useRfqById } from '../../rfq/api/rfqHooks';
import { Loader2 } from 'lucide-react';

const SubmitQuotationPage = () => {
  const { rfqId } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch RFQ details for context
  const { data: rfqRes, isPending: isLoadingRfq } = useRfqById(rfqId);
  const rfq = rfqRes?.data;

  // Set default quantity to total sum of line item quantities
  const totalRfqQty = rfq?.itemDetails?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 1;

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      unitPrice: '',
      quantity: 1,
      deliveryDays: '',
      remarks: ''
    }
  });

  // Watch for changes to calculate subtotal
  const unitPrice = watch('unitPrice');
  const quantity = watch('quantity');
  const subtotal = (parseFloat(unitPrice) || 0) * (parseFloat(quantity) || 0);

  // Update default quantity once RFQ is loaded
  useEffect(() => {
    if (rfq && !watch('quantity')) {
      setValue('quantity', totalRfqQty);
    }
  }, [rfq, setValue, totalRfqQty, watch]);

  const { mutateAsync: submitQuote } = useCreateQuotation();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await submitQuote({
        rfqId,
        unitPrice: parseFloat(data.unitPrice),
        quantity: parseFloat(data.quantity),
        deliveryDays: parseInt(data.deliveryDays, 10),
        remarks: data.remarks
      });
      navigate(`/rfqs/${rfqId}`);
    } catch (error) {
      console.error('Failed to submit quotation', error);
      alert(error?.response?.data?.message || 'Failed to submit quotation');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingRfq) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="animate-spin text-[#8A3223] w-8 h-8" />
      </div>
    );
  }

  if (!rfq) {
    return <div className="p-9 text-[#8A3223] font-['IBM_Plex_Mono']">RFQ not found.</div>;
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="flex justify-between items-center px-9 py-5 border-b-[1.5px] border-[#231F16] bg-[#EDE6D6]">
        <div>
          <h1 className="font-['Fraunces'] font-semibold text-[22px] text-[#231F16]">Submit Quotation</h1>
          <div className="font-['IBM_Plex_Mono'] text-[11.5px] text-[#6b6349] mt-1 tracking-wide uppercase">
            {rfq.rfqNumber}
          </div>
        </div>
        <button 
          onClick={() => navigate(`/rfqs/${rfqId}`)}
          className="font-['IBM_Plex_Mono'] text-[12.5px] text-[#8A3223] hover:underline"
        >
          ← Cancel
        </button>
      </div>

      <div className="p-9 max-w-4xl">
        <div className="border-[1.5px] border-[#231F16] bg-[#F4EFE3] p-6 mb-8 flex justify-between gap-6 flex-wrap">
          <div>
            <h3 className="font-['Fraunces'] font-semibold text-[17px] mb-2">{rfq.title}</h3>
            <p className="text-[13px] text-[#6b6349] max-w-xl">{rfq.description}</p>
          </div>
          <div className="font-['IBM_Plex_Mono'] text-[12px] text-[#4A4535] text-right">
            <div>Requested by {rfq.createdBy?.name || 'Unknown'}</div>
            <div className="text-[#8A3223] mt-1">Deadline: {new Date(rfq.deadline).toLocaleDateString()}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="border-[1.5px] border-[#231F16] bg-[#F4EFE3] mb-6">
            <div className="px-6 py-4 border-b-[1.5px] border-[#231F16]">
              <h3 className="font-['Fraunces'] font-semibold text-[16.5px]">Pricing & Terms</h3>
            </div>
            <div className="p-6">
              
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-[0.05em] text-[#4A4535] mb-2">Unit Price (₹)</label>
                  <input 
                    type="number" step="0.01" min="0.01"
                    {...register('unitPrice', { required: 'Unit price is required', valueAsNumber: true, min: 0.01 })}
                    className="w-full p-[11px] border-[1.5px] border-[#C9C0A8] bg-[#EDE6D6] rounded-[2px] font-sans text-[13.5px] text-[#231F16] focus:outline-none focus:border-[#8A3223]"
                    placeholder="Enter unit price"
                  />
                  {errors.unitPrice && <span className="text-[#8A3223] text-[11px] font-['IBM_Plex_Mono']">{errors.unitPrice.message}</span>}
                </div>
                
                <div>
                  <label className="block font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-[0.05em] text-[#4A4535] mb-2">Total Quantity</label>
                  <input 
                    type="number" min="1"
                    {...register('quantity', { required: 'Quantity is required', valueAsNumber: true, min: 1 })}
                    className="w-full p-[11px] border-[1.5px] border-[#C9C0A8] bg-[#EDE6D6] rounded-[2px] font-sans text-[13.5px] text-[#231F16] focus:outline-none focus:border-[#8A3223]"
                  />
                  {errors.quantity && <span className="text-[#8A3223] text-[11px] font-['IBM_Plex_Mono']">{errors.quantity.message}</span>}
                  <div className="text-[10px] text-[#6b6349] mt-1 font-['IBM_Plex_Mono']">
                    Defaulted to total requested in RFQ ({totalRfqQty})
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 pb-2 font-['IBM_Plex_Mono'] text-[14px]">
                Subtotal: <b className="ml-3 text-[18px]">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</b>
              </div>

            </div>
          </div>

          <div className="border-[1.5px] border-[#231F16] bg-[#F4EFE3] mb-6">
            <div className="px-6 py-4 border-b-[1.5px] border-[#231F16]">
              <h3 className="font-['Fraunces'] font-semibold text-[16.5px]">Delivery & Remarks</h3>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <label className="block font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-[0.05em] text-[#4A4535] mb-2">Delivery Timeline (Days)</label>
                <input 
                  type="number" min="1"
                  {...register('deliveryDays', { required: 'Delivery days is required', valueAsNumber: true, min: 1 })}
                  className="w-full max-w-sm p-[11px] border-[1.5px] border-[#C9C0A8] bg-[#EDE6D6] rounded-[2px] font-sans text-[13.5px] text-[#231F16] focus:outline-none focus:border-[#8A3223]"
                  placeholder="e.g. 14"
                />
                {errors.deliveryDays && <span className="text-[#8A3223] text-[11px] font-['IBM_Plex_Mono']">{errors.deliveryDays.message}</span>}
              </div>

              <div>
                <label className="block font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-[0.05em] text-[#4A4535] mb-2">Notes / Comments</label>
                <textarea 
                  {...register('remarks')}
                  rows={4}
                  className="w-full p-[11px] border-[1.5px] border-[#C9C0A8] bg-[#EDE6D6] rounded-[2px] font-sans text-[13.5px] text-[#231F16] focus:outline-none focus:border-[#8A3223] resize-y"
                  placeholder="Add any specific terms or notes..."
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-6 py-3 rounded-[2px] border-[1.5px] border-[#231F16] bg-[#231F16] text-[#EDE6D6] font-['IBM_Plex_Mono'] text-[13px] hover:bg-[#8A3223] hover:border-[#8A3223] transition-colors flex items-center justify-center min-w-[140px] disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : 'Submit quotation →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitQuotationPage;
