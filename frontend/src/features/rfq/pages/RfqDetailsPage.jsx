import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useRfqById } from '../api/rfqHooks';
import { useQuotations, useWithdrawQuotation } from '../../quotations/api/quotationHooks';
import useAuthStore from '../../../store/useAuthStore';
import { Loader2, FileText, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const StatusBadge = ({ status }) => {
  let bg = "bg-[rgba(35,31,22,0.08)]";
  let color = "text-[#4A4535]";
  
  if (['CLOSED', 'AWARDED', 'SELECTED'].includes(status)) {
    bg = "bg-[rgba(75,107,74,0.15)]";
    color = "text-[#4B6B4A]";
  } else if (['DRAFT'].includes(status)) {
    bg = "bg-[rgba(156,122,46,0.16)]";
    color = "text-[#9C7A2E]";
  } else if (['CANCELLED', 'REJECTED', 'WITHDRAWN'].includes(status)) {
    bg = "bg-[rgba(138,50,35,0.12)]";
    color = "text-[#8A3223]";
  } else if (['PUBLISHED', 'EVALUATING', 'SUBMITTED'].includes(status)) {
    bg = "bg-[rgba(75,107,74,0.15)]";
    color = "text-[#4B6B4A]";
  }

  return (
    <span className={`font-['IBM_Plex_Mono'] text-[10.5px] uppercase px-3 py-1 rounded-full inline-block tracking-wide whitespace-nowrap ${bg} ${color}`}>
      {status || 'UNKNOWN'}
    </span>
  );
};

const RfqDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const { data: response, isPending, isError, error } = useRfqById(id);
  const isVendor = user?.role === 'VENDOR';
  
  // Fetch quotation if vendor
  const { data: quotesRes, isPending: isLoadingQuotes } = useQuotations(
    { rfqId: id }, 
  );
  
  const { mutateAsync: withdrawQuote, isPending: isWithdrawing } = useWithdrawQuotation();

  const handleWithdraw = async (quoteId) => {
    if (window.confirm('Are you sure you want to withdraw this quotation?')) {
      try {
        await withdrawQuote(quoteId);
        alert('Quotation withdrawn successfully.');
      } catch (err) {
        alert(err?.response?.data?.message || 'Failed to withdraw quotation');
      }
    }
  };

  if (isPending || (isVendor && isLoadingQuotes)) {
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
          {error.response?.data?.message || error.message}
        </div>
      </div>
    );
  }

  const rfq = response?.data;
  const isOfficerOrAdmin = ['ADMIN', 'MANAGER', 'PROCUREMENT_OFFICER'].includes(user?.role);
  
  const vendorQuotation = isVendor && quotesRes?.data?.length > 0 ? quotesRes.data[0] : null;
  const isDeadlinePassed = new Date(rfq.deadline) < new Date();

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="flex-1 flex flex-col min-w-0"
    >
      <div className="flex justify-between items-center px-9 py-5 border-b-[1.5px] border-[#231F16] bg-[#EDE6D6] flex-wrap gap-4">
        <div>
          <h1 className="font-['Fraunces'] font-semibold text-[22px] text-[#231F16] flex items-center gap-4">
            {rfq.title}
            <StatusBadge status={rfq.status} />
          </h1>
          <div className="font-['IBM_Plex_Mono'] text-[11.5px] text-[#6b6349] mt-1 tracking-wide uppercase">
            {rfq.rfqNumber} &middot; Created by {rfq.createdBy?.name || 'Unknown'} &middot; Deadline: {new Date(rfq.deadline).toLocaleDateString()}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {isOfficerOrAdmin && (rfq.status === 'PUBLISHED' || rfq.status === 'EVALUATING') && (
            <button 
              onClick={() => navigate(`/rfqs/${rfq.id || rfq._id}/compare`)}
              className="px-4 py-2 bg-[#231F16] text-[#EDE6D6] font-['IBM_Plex_Mono'] text-[12.5px] rounded-[2px] border-[1.5px] border-[#231F16] hover:bg-[#8A3223] hover:border-[#8A3223] transition-colors"
            >
              Compare Quotations →
            </button>
          )}
          
          <button 
            onClick={() => navigate('/rfqs')}
            className="font-['IBM_Plex_Mono'] text-[12.5px] text-[#8A3223] hover:underline"
          >
            ← Back to RFQs
          </button>
        </div>
      </div>

      <div className="p-9 max-w-4xl space-y-6">
        
        {/* Vendor Actions */}
        {isVendor && (
          <div className="border-[1.5px] border-[#231F16] bg-[#F4EFE3] p-6 mb-8 flex justify-between items-center flex-wrap gap-4">
            <div>
              <h3 className="font-['Fraunces'] font-semibold text-[17px] mb-1">Your Quotation</h3>
              {vendorQuotation ? (
                <p className="text-[13px] text-[#6b6349] font-['IBM_Plex_Mono']">
                  Submitted on {new Date(vendorQuotation.createdAt || vendorQuotation.submittedAt).toLocaleDateString()}
                </p>
              ) : (
                <p className="text-[13px] text-[#6b6349]">
                  {isDeadlinePassed ? 'The deadline for this RFQ has passed.' : 'You have not submitted a quotation for this RFQ yet.'}
                </p>
              )}
            </div>
            
            {vendorQuotation ? (
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="font-['IBM_Plex_Mono'] text-[18px] font-bold">₹{vendorQuotation.totalAmount?.toLocaleString('en-IN')}</div>
                  <div className="mt-1"><StatusBadge status={vendorQuotation.status} /></div>
                </div>
                {vendorQuotation.status === 'SUBMITTED' && !isDeadlinePassed && (
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => handleWithdraw(vendorQuotation.id || vendorQuotation._id)}
                      disabled={isWithdrawing}
                      className="px-4 py-1.5 rounded-[2px] border border-[#8A3223] text-[#8A3223] font-['IBM_Plex_Mono'] text-[11.5px] hover:bg-[#8A3223] hover:text-[#EDE6D6] transition-colors"
                    >
                      Withdraw
                    </button>
                  </div>
                )}
              </div>
            ) : (
              !isDeadlinePassed && (
                <Link 
                  to={`/rfqs/${rfq.id || rfq._id}/quote`}
                  className="px-6 py-2.5 rounded-[2px] border-[1.5px] border-[#231F16] bg-[#231F16] text-[#EDE6D6] font-['IBM_Plex_Mono'] text-[12.5px] hover:bg-[#8A3223] hover:border-[#8A3223] transition-colors"
                >
                  Submit Quotation →
                </Link>
              )
            )}
          </div>
        )}

        {/* Description */}
        <div className="border-[1.5px] border-[#231F16] bg-[#F4EFE3] p-6">
          <h2 className="font-['Fraunces'] font-semibold text-[18px] mb-3">Scope & Description</h2>
          <p className="text-[14px] text-[#4A4535] whitespace-pre-wrap">{rfq.description || 'No description provided.'}</p>
        </div>

        {/* Line Items */}
        <div className="border-[1.5px] border-[#231F16] bg-[#F4EFE3] p-6">
          <h2 className="font-['Fraunces'] font-semibold text-[18px] mb-4">Line Items</h2>
          <table className="w-full text-left border-collapse border border-[#C9C0A8]">
            <thead>
              <tr className="bg-[#E4DBC7]">
                <th className="px-4 py-2 border border-[#C9C0A8] font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-wide text-[#6b6349]">Item Specification</th>
                <th className="px-4 py-2 border border-[#C9C0A8] font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-wide text-[#6b6349]">Quantity</th>
                <th className="px-4 py-2 border border-[#C9C0A8] font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-wide text-[#6b6349]">Unit</th>
              </tr>
            </thead>
            <tbody>
              {rfq.itemDetails?.map(item => (
                <tr key={item._id || item.id} className="border-b border-[#C9C0A8] last:border-0 hover:bg-[#EDE6D6]">
                  <td className="px-4 py-2.5 text-[13.5px] text-[#231F16]">{item.name}</td>
                  <td className="px-4 py-2.5 text-[13.5px] font-['IBM_Plex_Mono']">{item.quantity}</td>
                  <td className="px-4 py-2.5 text-[13.5px] font-['IBM_Plex_Mono'] text-[#4A4535]">{item.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Attachments */}
        {rfq.attachments?.length > 0 && (
          <div className="border-[1.5px] border-[#231F16] bg-[#F4EFE3] p-6">
            <h2 className="font-['Fraunces'] font-semibold text-[18px] mb-4">Attachments</h2>
            <div className="flex flex-col gap-2">
              {rfq.attachments.map((file, i) => (
                <a 
                  key={i} 
                  href={`http://localhost:3000${file.filePath}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-3 p-3 border border-[#C9C0A8] bg-[#EDE6D6] rounded-[2px] text-[13px] text-[#8A3223] hover:bg-[#E4DBC7] transition-colors w-fit"
                >
                  <FileText size={16} />
                  <span className="font-['IBM_Plex_Mono']">{file.fileName}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Vendors (Admin/PO only) */}
        {isOfficerOrAdmin && rfq.assignedVendors && (
          <div className="border-[1.5px] border-[#231F16] bg-[#F4EFE3] p-6">
            <h2 className="font-['Fraunces'] font-semibold text-[18px] mb-4">Assigned Vendors</h2>
            {rfq.assignedVendors.length === 0 ? (
              <p className="text-[13px] text-[#6b6349]">No vendors assigned yet.</p>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {rfq.assignedVendors.map(v => (
                  <div key={v.id || v.vendorId} className="p-3 border border-[#C9C0A8] bg-[#EDE6D6] flex justify-between items-center rounded-[2px]">
                    <span className="text-[13.5px] font-semibold text-[#231F16]">{v.companyName}</span>
                    {v.responded ? (
                      <span className="font-['IBM_Plex_Mono'] text-[10px] uppercase text-[#4B6B4A] bg-[rgba(75,107,74,0.15)] px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 size={12} /> Responded
                      </span>
                    ) : (
                      <span className="font-['IBM_Plex_Mono'] text-[10px] uppercase text-[#6b6349] bg-[rgba(35,31,22,0.08)] px-2 py-0.5 rounded-full">Pending</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </motion.div>
  );
};

export default RfqDetailsPage;
