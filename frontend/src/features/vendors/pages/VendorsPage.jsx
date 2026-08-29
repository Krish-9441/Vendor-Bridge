import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useVendors } from '../api/vendorHooks';
import { Loader2, Search } from 'lucide-react';
import useAuthStore from '../../../store/useAuthStore';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.05 } 
  }
};

const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

const StatusBadge = ({ status }) => {
  if (status === 'ACTIVE') {
    return <span className="font-['IBM_Plex_Mono'] text-[10px] text-[#4B6B4A] bg-[rgba(75,107,74,0.15)] uppercase px-2 py-0.5 rounded-full inline-block tracking-wide whitespace-nowrap">Active</span>;
  }
  if (status === 'PENDING') {
    return <span className="font-['IBM_Plex_Mono'] text-[10px] text-[#9C7A2E] bg-[rgba(156,122,46,0.16)] uppercase px-2 py-0.5 rounded-full inline-block tracking-wide whitespace-nowrap">Under review</span>;
  }
  return <span className="font-['IBM_Plex_Mono'] text-[10px] text-[#6b6349] bg-[rgba(35,31,22,0.08)] uppercase px-2 py-0.5 rounded-full inline-block tracking-wide whitespace-nowrap">Inactive</span>;
};

const RatingStars = ({ rating }) => {
  const stars = [];
  const validRating = Math.max(0, Math.min(5, Math.round(rating || 0)));
  for (let i = 0; i < 5; i++) {
    stars.push(i < validRating ? '★' : '☆');
  }
  return <span className="text-[#C68A2E] text-[12px] tracking-[1px]">{stars.join('')}</span>;
};

const VendorsPage = () => {
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page on search change
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: response, isPending, isError, error } = useVendors({
    status: status || undefined,
    search: debouncedSearch || undefined,
    page,
    limit: 10,
  });

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    setPage(1);
  };

  const vendors = response?.data || [];
  const meta = response?.meta || { total: 0, page: 1, totalPages: 1 };
  
  const canCreate = user?.role === 'PROCUREMENT_OFFICER' || user?.role === 'ADMIN';

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="flex justify-between items-center px-9 py-5 border-b-[1.5px] border-[#231F16] bg-[#EDE6D6]">
        <div>
          <h1 className="font-['Fraunces'] font-semibold text-[22px] text-[#231F16]">Vendor Management</h1>
          <div className="font-['IBM_Plex_Mono'] text-[11.5px] text-[#6b6349] mt-1 tracking-wide uppercase">
            {meta.total} REGISTERED
          </div>
        </div>
        {canCreate && (
          <button 
            onClick={() => navigate('/vendors/new')}
            className="px-4 py-2 rounded-[2px] border-[1.5px] border-[#231F16] bg-[#231F16] text-[#EDE6D6] font-['IBM_Plex_Mono'] text-[12.5px] hover:bg-[#8A3223] hover:border-[#8A3223] transition-colors"
          >
            + Register vendor
          </button>
        )}
      </div>

      <div className="p-9 flex-1">
        <div className="flex justify-between items-center mb-5 gap-4 flex-wrap">
          <div className="flex gap-2.5 flex-wrap">
            <button 
              onClick={() => handleStatusChange('')}
              className={`border-[1.5px] px-3.5 py-2 font-['IBM_Plex_Mono'] text-[12px] rounded-full transition-colors ${status === '' ? 'border-[#8A3223] text-[#8A3223] bg-[#F4EFE3]' : 'border-[#C9C0A8] text-[#6b6349] hover:bg-[#F4EFE3]'}`}
            >
              All
            </button>
            <button 
              onClick={() => handleStatusChange('ACTIVE')}
              className={`border-[1.5px] px-3.5 py-2 font-['IBM_Plex_Mono'] text-[12px] rounded-full transition-colors ${status === 'ACTIVE' ? 'border-[#8A3223] text-[#8A3223] bg-[#F4EFE3]' : 'border-[#C9C0A8] text-[#6b6349] hover:bg-[#F4EFE3]'}`}
            >
              Active
            </button>
            <button 
              onClick={() => handleStatusChange('PENDING')}
              className={`border-[1.5px] px-3.5 py-2 font-['IBM_Plex_Mono'] text-[12px] rounded-full transition-colors ${status === 'PENDING' ? 'border-[#8A3223] text-[#8A3223] bg-[#F4EFE3]' : 'border-[#C9C0A8] text-[#6b6349] hover:bg-[#F4EFE3]'}`}
            >
              Under review
            </button>
            <button 
              onClick={() => handleStatusChange('INACTIVE')}
              className={`border-[1.5px] px-3.5 py-2 font-['IBM_Plex_Mono'] text-[12px] rounded-full transition-colors ${status === 'INACTIVE' ? 'border-[#8A3223] text-[#8A3223] bg-[#F4EFE3]' : 'border-[#C9C0A8] text-[#6b6349] hover:bg-[#F4EFE3]'}`}
            >
              Inactive
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-[#6b6349]" size={16} />
            <input 
              type="text" 
              placeholder="Search by name, GST, category…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-[1.5px] border-[#C9C0A8] bg-[#F4EFE3] pl-9 pr-3.5 py-2 text-[13px] text-[#231F16] w-[260px] rounded-[2px] font-['IBM_Plex_Mono'] placeholder:text-[#6b6349] focus:outline-none focus:border-[#8A3223] transition-colors"
            />
          </div>
        </div>

        {isPending ? (
          <div className="flex justify-center p-12">
            <Loader2 className="animate-spin text-[#8A3223] w-8 h-8" />
          </div>
        ) : isError ? (
          <div className="p-4 border border-[#8A3223] bg-[#F4EFE3] text-[#8A3223] rounded-sm font-['IBM_Plex_Mono'] text-sm">
            Error loading vendors: {error?.response?.data?.message || error.message}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border-[1.5px] border-[#231F16] bg-[#F4EFE3]">
              <thead>
                <tr>
                  <th className="text-left px-3 py-3 font-['IBM_Plex_Mono'] text-[10.5px] uppercase tracking-wide text-[#6b6349] border-b-[1.5px] border-[#231F16] bg-[#E4DBC7]">Vendor</th>
                  <th className="text-left px-3 py-3 font-['IBM_Plex_Mono'] text-[10.5px] uppercase tracking-wide text-[#6b6349] border-b-[1.5px] border-[#231F16] bg-[#E4DBC7]">Category</th>
                  <th className="text-left px-3 py-3 font-['IBM_Plex_Mono'] text-[10.5px] uppercase tracking-wide text-[#6b6349] border-b-[1.5px] border-[#231F16] bg-[#E4DBC7]">GST No.</th>
                  <th className="text-left px-3 py-3 font-['IBM_Plex_Mono'] text-[10.5px] uppercase tracking-wide text-[#6b6349] border-b-[1.5px] border-[#231F16] bg-[#E4DBC7]">Contact</th>
                  <th className="text-left px-3 py-3 font-['IBM_Plex_Mono'] text-[10.5px] uppercase tracking-wide text-[#6b6349] border-b-[1.5px] border-[#231F16] bg-[#E4DBC7]">Rating</th>
                  <th className="text-left px-3 py-3 font-['IBM_Plex_Mono'] text-[10.5px] uppercase tracking-wide text-[#6b6349] border-b-[1.5px] border-[#231F16] bg-[#E4DBC7]">Status</th>
                  <th className="border-b-[1.5px] border-[#231F16] bg-[#E4DBC7]"></th>
                </tr>
              </thead>
              <motion.tbody variants={containerVariants} initial="hidden" animate="visible">
                {vendors.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center font-['IBM_Plex_Mono'] text-sm text-[#6b6349]">
                      No vendors found.
                    </td>
                  </tr>
                ) : (
                  vendors.map((v) => (
                    <motion.tr 
                      key={v.id || v._id} 
                      variants={rowVariants}
                      className="hover:bg-[#E4DBC7] transition-colors border-b border-[#C9C0A8] last:border-0"
                    >
                      <td className="px-3 py-3.5">
                        <div className="font-semibold text-[#231F16] text-[13.5px]">{v.companyName}</div>
                      </td>
                      <td className="px-3 py-3.5">
                        <span className="font-['IBM_Plex_Mono'] text-[11px] border border-[#C9C0A8] px-2 py-0.5 rounded-[2px] text-[#4A4535] whitespace-nowrap">
                          {v.category || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-3 py-3.5 font-['IBM_Plex_Mono'] text-[13.5px] whitespace-nowrap">{v.gstNumber}</td>
                      <td className="px-3 py-3.5 text-[13.5px] text-[#4A4535]">{v.contactEmail}</td>
                      <td className="px-3 py-3.5 whitespace-nowrap"><RatingStars rating={v.rating} /></td>
                      <td className="px-3 py-3.5"><StatusBadge status={v.status} /></td>
                      <td className="px-3 py-3.5 text-right whitespace-nowrap">
                        <Link to={`/vendors/${v.id || v._id}`} className="font-['IBM_Plex_Mono'] text-[11.5px] text-[#8A3223] hover:underline">
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

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="flex justify-between items-center mt-4 font-['IBM_Plex_Mono'] text-[12px] text-[#6b6349]">
            <span>
              Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, meta.total)} of {meta.total} vendors
            </span>
            <div className="flex gap-4">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="hover:text-[#8A3223] disabled:opacity-50 disabled:hover:text-[#6b6349]"
              >
                ← Prev
              </button>
              <span>Page {page} of {meta.totalPages}</span>
              <button 
                disabled={page === meta.totalPages}
                onClick={() => setPage(p => p + 1)}
                className="hover:text-[#8A3223] disabled:opacity-50 disabled:hover:text-[#6b6349]"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorsPage;
