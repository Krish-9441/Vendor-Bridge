import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApprovalById, useApproveQuotation, useRejectQuotation } from '../api/approvalHooks';
import { usePurchaseOrders } from '../../purchaseOrders/api/purchaseOrderHooks';
import { axiosInstance } from '../../../lib/axios';
import useAuthStore from '../../../store/useAuthStore';
import { Loader2 } from 'lucide-react';

const StatusBadge = ({ status }) => {
  let bg = "bg-[rgba(35,31,22,0.08)]";
  let color = "text-[#4A4535]";
  
  if (['APPROVED'].includes(status)) {
    bg = "bg-[rgba(75,107,74,0.15)]";
    color = "text-[#4B6B4A]";
  } else if (['PENDING'].includes(status)) {
    bg = "bg-[rgba(156,122,46,0.16)]";
    color = "text-[#9C7A2E]";
  } else if (['REJECTED'].includes(status)) {
    bg = "bg-[rgba(138,50,35,0.12)]";
    color = "text-[#8A3223]";
  }

  return (
    <span className={`font-['IBM_Plex_Mono'] text-[10.5px] uppercase px-3 py-1 rounded-full inline-block tracking-wide whitespace-nowrap ${bg} ${color}`}>
      {status || 'UNKNOWN'}
    </span>
  );
};

const ApprovalDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const { data: response, isPending, isError, error } = useApprovalById(id);
  const { mutateAsync: approve, isPending: isApproving } = useApproveQuotation();
  const { mutateAsync: reject, isPending: isRejecting } = useRejectQuotation();
  const [isGeneratingPo, setIsGeneratingPo] = useState(false);

  // Check if a PO already exists for this approval
  const { data: posResponse } = usePurchaseOrders({ limit: 100 });
  const existingPo = posResponse?.data?.purchaseOrders?.find(
    (po) => po.approvalId === id || po.approvalId?._id === id
  );

  const [remarks, setRemarks] = useState('');

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
          Failed to load approval: {error?.response?.data?.message || error.message}
        </div>
        <button onClick={() => navigate(-1)} className="mt-4 font-['IBM_Plex_Mono'] text-[12.5px] text-[#8A3223] hover:underline">
          ← Back
        </button>
      </div>
    );
  }

  const approval = response?.data;
  if (!approval) return null;

  const { rfqId: rfq, quotationId: quotation, requestedBy, approverId: approver, status } = approval;
  const vendor = quotation?.vendorId;
  const isManager = user?.role === 'MANAGER' || user?.role === 'ADMIN';
  const canAct = status === 'PENDING' && isManager;

  const handleApprove = async () => {
    if (window.confirm('Are you sure you want to approve this request?')) {
      try {
        await approve(id);
        navigate('/approvals');
      } catch (err) {
        alert(err?.response?.data?.message || 'Failed to approve');
      }
    }
  };

  const handleReject = async () => {
    if (!remarks.trim()) {
      alert('Remarks are required to reject an approval.');
      return;
    }
    if (window.confirm('Are you sure you want to reject this request? The RFQ will revert to EVALUATING.')) {
      try {
        await reject({ id, remarks });
        navigate('/approvals');
      } catch (err) {
        alert(err?.response?.data?.message || 'Failed to reject');
      }
    }
  };

  // Timeline computation
  const isApproved = status === 'APPROVED';
  const isRejected = status === 'REJECTED';

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="flex-1 flex flex-col min-w-0"
    >
      <div className="flex justify-between items-center px-9 py-5 border-b-[1.5px] border-[#231F16] bg-[#EDE6D6]">
        <div>
          <h1 className="font-['Fraunces'] font-semibold text-[22px] text-[#231F16]">Approval — {id.slice(-6).toUpperCase()}</h1>
          <div className="font-['IBM_Plex_Mono'] text-[11.5px] text-[#6b6349] mt-1 tracking-wide uppercase">
            {vendor?.companyName || 'Unknown Vendor'} &middot; {rfq?.rfqNumber}
          </div>
        </div>
        <button 
          onClick={() => navigate('/approvals')}
          className="font-['IBM_Plex_Mono'] text-[12.5px] text-[#8A3223] hover:underline"
        >
          ← Back to Approvals
        </button>
      </div>

      <div className="p-9 flex-1 grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6 items-start max-w-6xl">
        
        {/* Request Summary Card */}
        <div className="border-[1.5px] border-[#231F16] bg-[#F4EFE3]">
          <div className="px-6 py-4 border-b-[1.5px] border-[#231F16]">
            <h3 className="font-['Fraunces'] font-semibold text-[16.5px] text-[#231F16]">Request summary</h3>
          </div>
          <div className="p-6">
            <div className="mb-4">
              <StatusBadge status={status} />
            </div>

            <div className="flex justify-between py-2.5 border-b border-[#C9C0A8] text-[13.5px]">
              <span className="text-[#6b6349] font-['IBM_Plex_Mono'] text-[11.5px] uppercase">Vendor</span>
              <span className="font-medium text-[#231F16]">{vendor?.companyName || 'Unknown'}</span>
            </div>
            <div className="flex justify-between py-2.5 border-b border-[#C9C0A8] text-[13.5px]">
              <span className="text-[#6b6349] font-['IBM_Plex_Mono'] text-[11.5px] uppercase">RFQ</span>
              <span className="font-medium text-[#231F16]">{rfq?.rfqNumber} &middot; {rfq?.title}</span>
            </div>
            <div className="flex justify-between py-2.5 border-b border-[#C9C0A8] text-[13.5px]">
              <span className="text-[#6b6349] font-['IBM_Plex_Mono'] text-[11.5px] uppercase">Requested by</span>
              <span className="font-medium text-[#231F16]">{requestedBy?.name || 'System'}</span>
            </div>
            <div className="flex justify-between py-2.5 border-b border-[#C9C0A8] text-[13.5px]">
              <span className="text-[#6b6349] font-['IBM_Plex_Mono'] text-[11.5px] uppercase">Delivery timeline</span>
              <span className="font-['IBM_Plex_Mono'] text-[#231F16]">{quotation?.deliveryDays} business days</span>
            </div>
            <div className="flex justify-between py-2.5 border-b border-[#C9C0A8] text-[13.5px]">
              <span className="text-[#6b6349] font-['IBM_Plex_Mono'] text-[11.5px] uppercase">Total value</span>
              <span className="font-['IBM_Plex_Mono'] text-[18px] text-[#8A3223]">₹{quotation?.totalAmount?.toLocaleString('en-IN') || 0}</span>
            </div>
            <div className="flex justify-between py-2.5 text-[13.5px]">
              <span className="text-[#6b6349] font-['IBM_Plex_Mono'] text-[11.5px] uppercase">Submitted at</span>
              <span className="font-['IBM_Plex_Mono'] text-[#231F16]">{new Date(approval.createdAt).toLocaleDateString()} {new Date(approval.createdAt).toLocaleTimeString()}</span>
            </div>

            {canAct ? (
              <div className="mt-6">
                <label className="block font-['IBM_Plex_Mono'] text-[11px] uppercase text-[#4A4535] mb-2">
                  Approval remarks
                </label>
                <textarea 
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Add a note for the record — visible in the audit trail..."
                  className="w-full min-h-[80px] p-3 border-[1.5px] border-[#C9C0A8] bg-[#EDE6D6] font-['IBM_Plex_Sans'] text-[13.5px] rounded-[2px] resize-y focus:outline-none focus:border-[#8A3223]"
                />
                <div className="flex gap-3 mt-5">
                  <button 
                    onClick={handleApprove}
                    disabled={isApproving || isRejecting}
                    className="flex-1 p-3.5 border-[1.5px] border-[#4B6B4A] bg-[#4B6B4A] text-[#fff] font-['IBM_Plex_Mono'] text-[13px] rounded-[2px] hover:bg-[#3d573c] transition-colors disabled:opacity-50"
                  >
                    {isApproving ? 'Approving...' : '✓ Approve request'}
                  </button>
                  <button 
                    onClick={handleReject}
                    disabled={isApproving || isRejecting}
                    className="flex-1 p-3.5 border-[1.5px] border-[#8A3223] bg-transparent text-[#8A3223] font-['IBM_Plex_Mono'] text-[13px] rounded-[2px] hover:bg-[#8A3223] hover:text-[#fff] transition-colors disabled:opacity-50"
                  >
                    {isRejecting ? 'Rejecting...' : '✕ Reject'}
                  </button>
                </div>
              </div>
            ) : (
              (approval.remarks || isApproved || isRejected) && (
                <div className="mt-6 p-4 bg-[#EDE6D6] border border-[#C9C0A8] rounded-[2px]">
                  <div className="font-['IBM_Plex_Mono'] text-[11px] uppercase text-[#6b6349] mb-1">
                    Manager Remarks ({approver?.name || 'Manager'})
                  </div>
                  <div className="text-[13.5px] text-[#231F16]">
                    {approval.remarks || 'No remarks provided.'}
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="border-[1.5px] border-[#231F16] bg-[#F4EFE3]">
          <div className="px-6 py-4 border-b-[1.5px] border-[#231F16]">
            <h3 className="font-['Fraunces'] font-semibold text-[16.5px] text-[#231F16]">Approval timeline</h3>
          </div>
          <div className="p-6">
            <div className="relative">
              
              {/* RFQ Created */}
              <div className="flex gap-4 pb-6 relative">
                <div className="absolute left-[9px] top-[22px] bottom-0 w-[1px] bg-[#C9C0A8]"></div>
                <div className="w-[19px] h-[19px] rounded-full border-2 border-[#4B6B4A] bg-[#4B6B4A] text-white flex items-center justify-center text-[10px] z-10 shrink-0">✓</div>
                <div>
                  <h4 className="font-semibold text-[13.5px] text-[#231F16] mb-1">RFQ created</h4>
                  <div className="font-['IBM_Plex_Mono'] text-[11px] text-[#6b6349]">{rfq?.createdBy?.name || 'Officer'} &middot; {new Date(rfq?.createdAt || Date.now()).toLocaleDateString()}</div>
                </div>
              </div>

              {/* Quotation Submitted */}
              <div className="flex gap-4 pb-6 relative">
                <div className="absolute left-[9px] top-[22px] bottom-0 w-[1px] bg-[#C9C0A8]"></div>
                <div className="w-[19px] h-[19px] rounded-full border-2 border-[#4B6B4A] bg-[#4B6B4A] text-white flex items-center justify-center text-[10px] z-10 shrink-0">✓</div>
                <div>
                  <h4 className="font-semibold text-[13.5px] text-[#231F16] mb-1">Quotation submitted</h4>
                  <div className="font-['IBM_Plex_Mono'] text-[11px] text-[#6b6349]">{vendor?.companyName} &middot; {new Date(quotation?.createdAt || Date.now()).toLocaleDateString()}</div>
                </div>
              </div>

              {/* Selected for Approval */}
              <div className="flex gap-4 pb-6 relative">
                <div className="absolute left-[9px] top-[22px] bottom-0 w-[1px] bg-[#C9C0A8]"></div>
                <div className="w-[19px] h-[19px] rounded-full border-2 border-[#4B6B4A] bg-[#4B6B4A] text-white flex items-center justify-center text-[10px] z-10 shrink-0">✓</div>
                <div>
                  <h4 className="font-semibold text-[13.5px] text-[#231F16] mb-1">Selected after comparison</h4>
                  <div className="font-['IBM_Plex_Mono'] text-[11px] text-[#6b6349]">{requestedBy?.name} &middot; {new Date(approval.createdAt).toLocaleDateString()}</div>
                </div>
              </div>

              {/* Manager Approval */}
              <div className="flex gap-4 pb-6 relative">
                {isApproved && <div className="absolute left-[9px] top-[22px] bottom-0 w-[1px] bg-[#C9C0A8]"></div>}
                
                {isApproved ? (
                  <div className="w-[19px] h-[19px] rounded-full border-2 border-[#4B6B4A] bg-[#4B6B4A] text-white flex items-center justify-center text-[10px] z-10 shrink-0">✓</div>
                ) : isRejected ? (
                  <div className="w-[19px] h-[19px] rounded-full border-2 border-[#8A3223] bg-[#8A3223] text-white flex items-center justify-center text-[10px] z-10 shrink-0">✕</div>
                ) : (
                  <div className="w-[19px] h-[19px] rounded-full border-2 border-[#8A3223] bg-[#8A3223] text-white flex items-center justify-center text-[10px] z-10 shrink-0">●</div>
                )}
                
                <div>
                  <h4 className="font-semibold text-[13.5px] text-[#231F16] mb-1">
                    {isApproved ? 'Manager approved' : isRejected ? 'Manager rejected' : 'Awaiting manager approval'}
                  </h4>
                  <div className="font-['IBM_Plex_Mono'] text-[11px] text-[#6b6349]">
                    {isApproved || isRejected ? `${approver?.name || 'Manager'} · ${new Date(approval.updatedAt).toLocaleDateString()}` : 'Manager · in progress'}
                  </div>
                  {(isApproved || isRejected) && approval.remarks && (
                    <div className="text-[12.5px] text-[#4A4535] mt-1.5 italic">
                      "{approval.remarks}"
                    </div>
                  )}
                </div>
              </div>

              {/* PO Generation */}
              {(!isRejected) && (
                <div className="flex gap-4">
                  <div className={`w-[19px] h-[19px] rounded-full border-2 ${existingPo ? 'border-[#4B6B4A] bg-[#4B6B4A] text-white' : isApproved ? 'border-[#8A3223] bg-[#8A3223] text-white' : 'border-[#C9C0A8] text-[#C9C0A8] bg-[#F4EFE3]'} flex items-center justify-center text-[10px] z-10 shrink-0`}>
                    {existingPo ? '✓' : isApproved ? '●' : '○'}
                  </div>
                  <div>
                    <h4 className="font-semibold text-[13.5px] text-[#231F16] mb-1">Purchase order generation</h4>
                    <div className="font-['IBM_Plex_Mono'] text-[11px] text-[#6b6349] mb-3">
                      {existingPo
                        ? `Generated · ${existingPo.poNumber}`
                        : isApproved
                        ? 'Awaiting generation'
                        : 'Not started'}
                    </div>
                    {existingPo ? (
                      <Link
                        to={`/purchase-orders/${existingPo._id}`}
                        className="px-4 py-2 border-[1.5px] border-[#4B6B4A] font-['IBM_Plex_Mono'] text-[11.5px] text-[#4B6B4A] hover:bg-[#4B6B4A] hover:text-white transition-colors inline-block"
                      >
                        View Purchase Order →
                      </Link>
                    ) : isApproved && (user?.role === 'PROCUREMENT_OFFICER' || user?.role === 'ADMIN') ? (
                      <button
                        disabled={isGeneratingPo}
                        onClick={async () => {
                          setIsGeneratingPo(true);
                          try {
                            const res = await axiosInstance.post('/purchase-orders', { approvalId: id });
                            navigate(`/purchase-orders/${res.data.data._id}`);
                          } catch (err) {
                            alert(err?.response?.data?.message || 'Failed to generate PO');
                            setIsGeneratingPo(false);
                          }
                        }}
                        className="px-4 py-2 border-[1.5px] border-[#231F16] font-['IBM_Plex_Mono'] text-[11.5px] cursor-pointer bg-transparent hover:bg-[#4B6B4A] hover:border-[#4B6B4A] hover:text-[#fff] transition-colors disabled:opacity-50"
                      >
                        {isGeneratingPo ? 'Generating...' : 'Generate Purchase Order'}
                      </button>
                    ) : null}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default ApprovalDetailsPage;
