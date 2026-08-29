import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVendorDetails, useUpdateVendorStatus } from '../api/vendorHooks';
import useAuthStore from '../../../store/useAuthStore';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const StatusBadge = ({ status }) => {
  if (status === 'ACTIVE') {
    return <span className="font-['IBM_Plex_Mono'] text-[11.5px] text-[#4B6B4A] bg-[rgba(75,107,74,0.15)] uppercase px-3 py-1 rounded-full inline-block tracking-wide whitespace-nowrap">Active</span>;
  }
  if (status === 'PENDING') {
    return <span className="font-['IBM_Plex_Mono'] text-[11.5px] text-[#9C7A2E] bg-[rgba(156,122,46,0.16)] uppercase px-3 py-1 rounded-full inline-block tracking-wide whitespace-nowrap">Under review</span>;
  }
  return <span className="font-['IBM_Plex_Mono'] text-[11.5px] text-[#6b6349] bg-[rgba(35,31,22,0.08)] uppercase px-3 py-1 rounded-full inline-block tracking-wide whitespace-nowrap">Inactive</span>;
};

const VendorDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const { data: response, isPending, isError, error } = useVendorDetails(id);
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateVendorStatus();

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    updateStatus({ id, status: newStatus });
  };

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
          {error.response?.data?.message || error.message}
        </div>
      </div>
    );
  }

  const vendor = response?.data;
  const canEditStatus = user?.role === 'ADMIN';

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="flex-1 flex flex-col min-w-0"
    >
      <div className="flex justify-between items-center px-9 py-5 border-b-[1.5px] border-[#231F16] bg-[#EDE6D6]">
        <div>
          <h1 className="font-['Fraunces'] font-semibold text-[22px] text-[#231F16] flex items-center gap-4">
            {vendor.companyName}
            <StatusBadge status={vendor.status} />
          </h1>
          <div className="font-['IBM_Plex_Mono'] text-[11.5px] text-[#6b6349] mt-1 tracking-wide uppercase">
            GSTIN: {vendor.gstNumber} &middot; Added {new Date(vendor.createdAt).toLocaleDateString()}
          </div>
        </div>
        <button 
          onClick={() => navigate('/vendors')}
          className="font-['IBM_Plex_Mono'] text-[12.5px] text-[#8A3223] hover:underline"
        >
          ← Back to Vendors
        </button>
      </div>

      <div className="p-9 max-w-4xl space-y-6">
        
        {/* Admin Actions */}
        {canEditStatus && (
          <div className="border-[1.5px] border-[#8A3223] bg-[#F4EFE3] p-5 flex items-center justify-between">
            <div className="font-['IBM_Plex_Mono'] text-[12.5px] text-[#4A4535]">
              <strong className="text-[#8A3223]">Admin Action:</strong> Change Vendor Status
            </div>
            <select 
              value={vendor.status}
              onChange={handleStatusChange}
              disabled={isUpdating}
              className="border-[1.5px] border-[#8A3223] bg-[#EDE6D6] px-3 py-1.5 text-[12px] font-['IBM_Plex_Mono'] focus:outline-none disabled:opacity-50"
            >
              <option value="PENDING">Under Review (PENDING)</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="border-[1.5px] border-[#231F16] bg-[#F4EFE3] p-6">
            <div className="font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-wide text-[#6b6349] mb-3">Total RFQs Invited</div>
            <div className="font-['Fraunces'] font-semibold text-[32px]">{vendor.totalRfqsInvited || 0}</div>
          </div>
          <div className="border-[1.5px] border-[#231F16] bg-[#F4EFE3] p-6">
            <div className="font-['IBM_Plex_Mono'] text-[11px] uppercase tracking-wide text-[#6b6349] mb-3">Total Quotations Won</div>
            <div className="font-['Fraunces'] font-semibold text-[32px]">{vendor.totalQuotationsWon || 0}</div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="border-[1.5px] border-[#231F16] bg-[#F4EFE3] p-6">
          <h2 className="font-['Fraunces'] font-semibold text-[18px] mb-5">Profile Details</h2>
          
          <div className="grid grid-cols-2 gap-y-6 gap-x-12">
            <div>
              <div className="font-['IBM_Plex_Mono'] text-[10.5px] uppercase tracking-wide text-[#6b6349] mb-1">Company Name</div>
              <div className="text-[14px] text-[#231F16]">{vendor.companyName}</div>
            </div>
            <div>
              <div className="font-['IBM_Plex_Mono'] text-[10.5px] uppercase tracking-wide text-[#6b6349] mb-1">GST Number</div>
              <div className="font-['IBM_Plex_Mono'] text-[14px] text-[#231F16]">{vendor.gstNumber}</div>
            </div>
            <div>
              <div className="font-['IBM_Plex_Mono'] text-[10.5px] uppercase tracking-wide text-[#6b6349] mb-1">Category</div>
              <div className="text-[14px] text-[#231F16]">{vendor.category || 'Uncategorized'}</div>
            </div>
            <div>
              <div className="font-['IBM_Plex_Mono'] text-[10.5px] uppercase tracking-wide text-[#6b6349] mb-1">Rating</div>
              <div className="text-[14px] text-[#231F16]">{vendor.rating ? `${vendor.rating} / 5` : 'No rating'}</div>
            </div>
            <div>
              <div className="font-['IBM_Plex_Mono'] text-[10.5px] uppercase tracking-wide text-[#6b6349] mb-1">Contact Email</div>
              <div className="text-[14px] text-[#231F16]">{vendor.contactEmail}</div>
            </div>
            <div>
              <div className="font-['IBM_Plex_Mono'] text-[10.5px] uppercase tracking-wide text-[#6b6349] mb-1">Contact Phone</div>
              <div className="text-[14px] text-[#231F16]">{vendor.contactPhone || 'N/A'}</div>
            </div>
            <div className="col-span-2">
              <div className="font-['IBM_Plex_Mono'] text-[10.5px] uppercase tracking-wide text-[#6b6349] mb-1">Address</div>
              <div className="text-[14px] text-[#231F16]">{vendor.address || 'Address not provided'}</div>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default VendorDetailsPage;
