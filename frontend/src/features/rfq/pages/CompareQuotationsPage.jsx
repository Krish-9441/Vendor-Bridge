import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCompareQuotations } from '../api/rfqHooks';
import { useSelectQuotation } from '../../quotations/api/quotationHooks';
import { Loader2 } from 'lucide-react';

const CompareQuotationsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { data: compareRes, isPending, isError, error } = useCompareQuotations(id);
  const { mutateAsync: selectQuote, isPending: isSelecting } = useSelectQuotation();
  
  const [sortBy, setSortBy] = useState('price'); // 'price', 'delivery'

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
          Failed to load comparison: {error?.response?.data?.message || error.message}
        </div>
        <button onClick={() => navigate(-1)} className="mt-4 font-['IBM_Plex_Mono'] text-[12.5px] text-[#8A3223] hover:underline">
          ← Back
        </button>
      </div>
    );
  }

  const { rfq, quotations, metrics } = compareRes?.data || {};

  // Sort quotations based on active sort mode
  const sortedQuotations = [...(quotations || [])].sort((a, b) => {
    if (sortBy === 'price') return a.totalAmount - b.totalAmount;
    if (sortBy === 'delivery') return a.deliveryDays - b.deliveryDays;
    return 0;
  });

  const handleSelect = async (quoteId) => {
    if (window.confirm('Are you sure you want to select this quotation? This will close the RFQ and create a pending approval for your manager.')) {
      try {
        await selectQuote(quoteId);
        alert('Quotation selected successfully and sent for approval.');
        navigate(`/rfqs/${id}`);
      } catch (err) {
        alert(err?.response?.data?.message || 'Failed to select quotation');
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="flex justify-between items-center px-9 py-5 border-b-[1.5px] border-[#231F16] bg-[#EDE6D6]">
        <div>
          <h1 className="font-['Fraunces'] font-semibold text-[22px] text-[#231F16]">Compare Quotations</h1>
          <div className="font-['IBM_Plex_Mono'] text-[11.5px] text-[#6b6349] mt-1 tracking-wide uppercase">
            {rfq?.rfqNumber} &middot; {rfq?.title}
          </div>
        </div>
        <button 
          onClick={() => navigate(`/rfqs/${id}`)}
          className="font-['IBM_Plex_Mono'] text-[12.5px] text-[#8A3223] hover:underline"
        >
          ← Back to RFQ
        </button>
      </div>

      <div className="p-9 flex-1">
        
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div className="flex gap-2.5 font-['IBM_Plex_Mono'] text-[12px]">
            <button 
              onClick={() => setSortBy('price')}
              className={`border-[1.5px] px-3.5 py-2 rounded-full transition-colors ${sortBy === 'price' ? 'border-[#8A3223] text-[#8A3223] bg-[#F4EFE3]' : 'border-[#C9C0A8] text-[#6b6349] hover:bg-[#F4EFE3]'}`}
            >
              Sort: Lowest price
            </button>
            <button 
              onClick={() => setSortBy('delivery')}
              className={`border-[1.5px] px-3.5 py-2 rounded-full transition-colors ${sortBy === 'delivery' ? 'border-[#8A3223] text-[#8A3223] bg-[#F4EFE3]' : 'border-[#C9C0A8] text-[#6b6349] hover:bg-[#F4EFE3]'}`}
            >
              Fastest delivery
            </button>
          </div>
          <span className="font-['IBM_Plex_Mono'] text-[12px] text-[#6b6349]">
            {quotations?.length || 0} quotations received
          </span>
        </div>

        {!quotations || quotations.length === 0 ? (
          <div className="p-8 text-center text-[#6b6349] font-['IBM_Plex_Mono']">
            No submitted quotations found for this RFQ.
          </div>
        ) : (
          <div className="overflow-x-auto pb-4">
            <table className="w-full border-collapse border-[1.5px] border-[#231F16] bg-[#F4EFE3] min-w-[800px]">
              <thead>
                <tr>
                  <th className="p-4 border-b-[1.5px] border-[#231F16] bg-[#E4DBC7] text-left font-['IBM_Plex_Mono'] text-[11px] uppercase text-[#6b6349] w-[170px]">
                    Vendor Details
                  </th>
                  {sortedQuotations.map(qt => (
                    <th 
                      key={qt.id || qt._id} 
                      className={`p-4 border-b-[1.5px] border-l-[1.5px] border-[#231F16] bg-[#E4DBC7] text-left align-top ${(metrics?.lowestPriceId === qt.id || metrics?.lowestPriceId === qt._id) ? 'bg-[rgba(75,107,74,0.07)]' : ''}`}
                    >
                      <h4 className="font-['Fraunces'] font-semibold text-[15.5px] mb-1 text-[#231F16]">
                        {qt.vendorId?.companyName || 'Unknown Vendor'}
                      </h4>
                      {(metrics?.lowestPriceId === qt.id || metrics?.lowestPriceId === qt._id) && (
                        <div className="inline-block font-['IBM_Plex_Mono'] text-[10px] text-[#4B6B4A] border border-[#4B6B4A] px-2 py-0.5 rounded-full mt-1">
                          Lowest price
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-4 border-b border-[#C9C0A8] font-['IBM_Plex_Mono'] text-[11px] uppercase text-[#6b6349]">
                    Total Price
                  </td>
                  {sortedQuotations.map(qt => {
                    const isLowest = metrics?.lowestPriceId === (qt.id || qt._id);
                    return (
                      <td key={qt.id || qt._id} className={`p-4 border-b border-l border-[#C9C0A8] ${isLowest ? 'bg-[rgba(75,107,74,0.07)]' : ''}`}>
                        <span className={`font-['IBM_Plex_Mono'] text-[17px] ${isLowest ? 'text-[#4B6B4A] font-semibold' : 'text-[#231F16]'}`}>
                          ₹{qt.totalAmount?.toLocaleString('en-IN')}
                        </span>
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td className="p-4 border-b border-[#C9C0A8] font-['IBM_Plex_Mono'] text-[11px] uppercase text-[#6b6349]">
                    Delivery Timeline
                  </td>
                  {sortedQuotations.map(qt => {
                    const isFastest = metrics?.fastestDeliveryId === (qt.id || qt._id);
                    const isLowestPrice = metrics?.lowestPriceId === (qt.id || qt._id);
                    return (
                      <td key={qt.id || qt._id} className={`p-4 border-b border-l border-[#C9C0A8] ${isLowestPrice ? 'bg-[rgba(75,107,74,0.07)]' : ''}`}>
                        <span className={`font-['IBM_Plex_Mono'] text-[13px] ${isFastest ? 'text-[#4B6B4A] font-semibold' : 'text-[#231F16]'}`}>
                          {qt.deliveryDays} business days
                        </span>
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td className="p-4 border-b border-[#C9C0A8] font-['IBM_Plex_Mono'] text-[11px] uppercase text-[#6b6349]">
                    Submitted At
                  </td>
                  {sortedQuotations.map(qt => {
                    const isLowestPrice = metrics?.lowestPriceId === (qt.id || qt._id);
                    return (
                      <td key={qt.id || qt._id} className={`p-4 border-b border-l border-[#C9C0A8] ${isLowestPrice ? 'bg-[rgba(75,107,74,0.07)]' : ''}`}>
                        <span className="font-['IBM_Plex_Mono'] text-[13px] text-[#4A4535]">
                          {new Date(qt.submittedAt || qt.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td className="p-4 border-b border-[#C9C0A8] font-['IBM_Plex_Mono'] text-[11px] uppercase text-[#6b6349]">
                    Notes
                  </td>
                  {sortedQuotations.map(qt => {
                    const isLowestPrice = metrics?.lowestPriceId === (qt.id || qt._id);
                    return (
                      <td key={qt.id || qt._id} className={`p-4 border-b border-l border-[#C9C0A8] ${isLowestPrice ? 'bg-[rgba(75,107,74,0.07)]' : ''}`}>
                        <div className="text-[12.5px] text-[#6b6349] max-w-[220px] whitespace-pre-wrap">
                          {qt.remarks || 'No notes provided.'}
                        </div>
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td className="p-4 font-['IBM_Plex_Mono'] text-[11px] uppercase text-[#6b6349]">
                    Decision
                  </td>
                  {sortedQuotations.map(qt => {
                    const isLowestPrice = metrics?.lowestPriceId === (qt.id || qt._id);
                    return (
                      <td key={qt.id || qt._id} className={`p-4 border-l border-[#C9C0A8] ${isLowestPrice ? 'bg-[rgba(75,107,74,0.07)]' : ''}`}>
                        <button 
                          onClick={() => handleSelect(qt.id || qt._id)}
                          disabled={isSelecting || rfq?.status !== 'PUBLISHED' && rfq?.status !== 'EVALUATING'}
                          className="px-4 py-2 border-[1.5px] border-[#231F16] font-['IBM_Plex_Mono'] text-[11.5px] cursor-pointer bg-transparent hover:bg-[#4B6B4A] hover:border-[#4B6B4A] hover:text-[#fff] transition-colors disabled:opacity-50"
                        >
                          {isSelecting ? 'Processing...' : 'Select Vendor'}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompareQuotationsPage;
