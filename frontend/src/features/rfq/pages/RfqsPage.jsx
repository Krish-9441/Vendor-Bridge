import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useRfqs } from '../api/rfqHooks';
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
  let bg = "bg-[rgba(35,31,22,0.08)]";
  let color = "text-[#4A4535]";
  
  if (['CLOSED', 'AWARDED'].includes(status)) {
    bg = "bg-[rgba(75,107,74,0.15)]";
    color = "text-[#4B6B4A]";
  } else if (['DRAFT'].includes(status)) {
    bg = "bg-[rgba(156,122,46,0.16)]";
    color = "text-[#9C7A2E]";
  } else if (['CANCELLED'].includes(status)) {
    bg = "bg-[rgba(138,50,35,0.12)]";
    color = "text-[#8A3223]";
  } else if (['PUBLISHED', 'EVALUATING'].includes(status)) {
    bg = "bg-[rgba(75,107,74,0.15)]"; // could also use green or amber
    color = "text-[#4B6B4A]";
  }

  return (
    <span className={`font-['IBM_Plex_Mono'] text-[10px] uppercase px-2 py-0.5 rounded-full inline-block tracking-wide whitespace-nowrap ${bg} ${color}`}>
      {status || 'UNKNOWN'}
    </span>
  );
};

const RfqsPage = () => {
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: response, isPending, isError, error } = useRfqs({
    status: status || undefined,
    search: debouncedSearch || undefined,
    page,
    limit: 10,
  });

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    setPage(1);
  };

  const rfqs = response?.data || [];
  const meta = response?.meta || { total: 0, page: 1, totalPages: 1 };
  
  const canCreate = user?.role === 'PROCUREMENT_OFFICER' || user?.role === 'ADMIN';

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="flex justify-between items-center px-9 py-5 border-b-[1.5px] border-[#231F16] bg-[#EDE6D6]">
        <div>
          <h1 className="font-['Fraunces'] font-semibold text-[22px] text-[#231F16]">RFQs</h1>
          <div className="font-['IBM_Plex_Mono'] text-[11.5px] text-[#6b6349] mt-1 tracking-wide uppercase">
            {meta.total} Requests Found
          </div>
        </div>
        {canCreate && (
          <button 
            onClick={() => navigate('/rfqs/new')}
            className="px-4 py-2 rounded-[2px] border-[1.5px] border-[#231F16] bg-[#231F16] text-[#EDE6D6] font-['IBM_Plex_Mono'] text-[12.5px] hover:bg-[#8A3223] hover:border-[#8A3223] transition-colors"
          >
            + Create RFQ
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
              onClick={() => handleStatusChange('PUBLISHED')}
              className={`border-[1.5px] px-3.5 py-2 font-['IBM_Plex_Mono'] text-[12px] rounded-full transition-colors ${status === 'PUBLISHED' ? 'border-[#8A3223] text-[#8A3223] bg-[#F4EFE3]' : 'border-[#C9C0A8] text-[#6b6349] hover:bg-[#F4EFE3]'}`}
            >
              Published
            </button>
            {canCreate && (
              <button 
                onClick={() => handleStatusChange('DRAFT')}
                className={`border-[1.5px] px-3.5 py-2 font-['IBM_Plex_Mono'] text-[12px] rounded-full transition-colors ${status === 'DRAFT' ? 'border-[#8A3223] text-[#8A3223] bg-[#F4EFE3]' : 'border-[#C9C0A8] text-[#6b6349] hover:bg-[#F4EFE3]'}`}
              >
                Drafts
              </button>
            )}
            <button 
              onClick={() => handleStatusChange('CLOSED')}
              className={`border-[1.5px] px-3.5 py-2 font-['IBM_Plex_Mono'] text-[12px] rounded-full transition-colors ${status === 'CLOSED' ? 'border-[#8A3223] text-[#8A3223] bg-[#F4EFE3]' : 'border-[#C9C0A8] text-[#6b6349] hover:bg-[#F4EFE3]'}`}
            >
              Closed
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-[#6b6349]" size={16} />
            <input 
              type="text" 
              placeholder="Search RFQ by title or number…"
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
            Error loading RFQs: {error?.response?.data?.message || error.message}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border-[1.5px] border-[#231F16] bg-[#F4EFE3]">
              <thead>
                <tr>
                  <th className="text-left px-3 py-3 font-['IBM_Plex_Mono'] text-[10.5px] uppercase tracking-wide text-[#6b6349] border-b-[1.5px] border-[#231F16] bg-[#E4DBC7]">RFQ Number</th>
                  <th className="text-left px-3 py-3 font-['IBM_Plex_Mono'] text-[10.5px] uppercase tracking-wide text-[#6b6349] border-b-[1.5px] border-[#231F16] bg-[#E4DBC7]">Title</th>
                  <th className="text-left px-3 py-3 font-['IBM_Plex_Mono'] text-[10.5px] uppercase tracking-wide text-[#6b6349] border-b-[1.5px] border-[#231F16] bg-[#E4DBC7]">Deadline</th>
                  {canCreate && (
                    <th className="text-left px-3 py-3 font-['IBM_Plex_Mono'] text-[10.5px] uppercase tracking-wide text-[#6b6349] border-b-[1.5px] border-[#231F16] bg-[#E4DBC7]">Vendors</th>
                  )}
                  <th className="text-left px-3 py-3 font-['IBM_Plex_Mono'] text-[10.5px] uppercase tracking-wide text-[#6b6349] border-b-[1.5px] border-[#231F16] bg-[#E4DBC7]">Quotes</th>
                  <th className="text-left px-3 py-3 font-['IBM_Plex_Mono'] text-[10.5px] uppercase tracking-wide text-[#6b6349] border-b-[1.5px] border-[#231F16] bg-[#E4DBC7]">Status</th>
                  <th className="border-b-[1.5px] border-[#231F16] bg-[#E4DBC7]"></th>
                </tr>
              </thead>
              <motion.tbody variants={containerVariants} initial="hidden" animate="visible">
                {rfqs.length === 0 ? (
                  <tr>
                    <td colSpan={canCreate ? "7" : "6"} className="px-4 py-8 text-center font-['IBM_Plex_Mono'] text-sm text-[#6b6349]">
                      No RFQs found.
                    </td>
                  </tr>
                ) : (
                  rfqs.map((rfq) => (
                    <motion.tr 
                      key={rfq.id || rfq._id} 
                      variants={rowVariants}
                      className="hover:bg-[#E4DBC7] transition-colors border-b border-[#C9C0A8] last:border-0"
                    >
                      <td className="px-3 py-3.5 font-['IBM_Plex_Mono'] text-[13.5px] whitespace-nowrap">{rfq.rfqNumber}</td>
                      <td className="px-3 py-3.5">
                        <div className="font-semibold text-[#231F16] text-[13.5px]">{rfq.title}</div>
                      </td>
                      <td className="px-3 py-3.5 text-[13.5px] text-[#4A4535] whitespace-nowrap">
                        {new Date(rfq.deadline).toLocaleDateString()}
                      </td>
                      {canCreate && (
                        <td className="px-3 py-3.5 font-['IBM_Plex_Mono'] text-[13.5px] text-[#4A4535]">
                          {rfq.assignedVendorCount || 0}
                        </td>
                      )}
                      <td className="px-3 py-3.5 font-['IBM_Plex_Mono'] text-[13.5px] text-[#4A4535]">
                        {rfq.quotationCount || 0}
                      </td>
                      <td className="px-3 py-3.5"><StatusBadge status={rfq.status} /></td>
                      <td className="px-3 py-3.5 text-right whitespace-nowrap">
                        <Link to={`/rfqs/${rfq.id || rfq._id}`} className="font-['IBM_Plex_Mono'] text-[11.5px] text-[#8A3223] hover:underline">
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
              Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, meta.total)} of {meta.total} RFQs
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

export default RfqsPage;
