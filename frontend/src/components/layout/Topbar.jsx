import React from 'react';
import useAuthStore from '../../store/useAuthStore';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useLogout } from '../../features/auth/api/authHooks';
import NotificationBell from '../../features/notifications/components/NotificationBell';
const getPageTitle = (pathname) => {
  if (pathname.includes('/dashboard')) return 'Dashboard';
  if (pathname.includes('/rfqs')) return 'RFQs';
  if (pathname.includes('/vendors')) return 'Vendors';
  if (pathname.includes('/quotations')) return 'Quotations';
  if (pathname.includes('/approvals')) return 'Approvals';
  if (pathname.includes('/purchase-orders')) return 'Purchase Orders';
  if (pathname.includes('/invoices')) return 'Invoices';
  if (pathname.includes('/reports')) return 'Reports & Analytics';
  if (pathname.includes('/activity-logs')) return 'Activity & Logs';
  return 'Dashboard';
};

const Topbar = () => {
  const { user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const { mutate: logout } = useLogout();
  const role = user?.role?.toUpperCase();

  const title = getPageTitle(location.pathname);
  const dateStr = new Date().toLocaleDateString('en-GB', { 
    weekday: 'short', 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  }).toUpperCase().replace(/,/g, '');

  return (
    <div className="flex justify-between items-center px-9 py-5 border-b-[1.5px] border-[#231F16] bg-[#EDE6D6]">
      <div>
        <h1 className="font-['Fraunces'] font-semibold text-[22px] text-[#231F16]">{title}</h1>
        <div className="font-['IBM_Plex_Mono'] text-[11.5px] text-[#6b6349] mt-1 tracking-wide">
          {dateStr} &middot; ALL SYSTEMS NORMAL
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <input 
          type="text" 
          placeholder="Search PO, RFQ, vendor…"
          className="border-[1.5px] border-[#C9C0A8] bg-[#F4EFE3] px-3.5 py-2 text-[13px] text-[#231F16] w-[220px] rounded-[2px] font-['IBM_Plex_Mono'] placeholder:text-[#6b6349] focus:outline-none focus:border-[#8A3223] transition-colors"
        />
        
        <NotificationBell />

        {role !== 'VENDOR' && (
          <button 
            className="px-4 py-2 rounded-[2px] border-[1.5px] border-[#231F16] bg-[#231F16] text-[#EDE6D6] font-['IBM_Plex_Mono'] text-[12.5px] hover:bg-[#8A3223] hover:border-[#8A3223] transition-colors"
            onClick={() => navigate('/rfqs/new')}
          >
            + New RFQ
          </button>
        )}
        <button
          onClick={() => logout()}
          className="px-4 py-2 rounded-[2px] border-[1.5px] border-[#231F16] bg-transparent text-[#231F16] font-['IBM_Plex_Mono'] text-[12.5px] hover:bg-[#E4DBC7] transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Topbar;
