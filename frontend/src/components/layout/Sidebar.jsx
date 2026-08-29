import React from 'react';
import { NavLink } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

const Sidebar = () => {
  const { user } = useAuthStore();
  
  if (!user) return null;

  const role = user.role?.toUpperCase() || 'VIEWER';
  
  // Get initials for avatar
  const initials = user.name
    ? user.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';

  const formatRole = (r) => {
    return r.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const NavItem = ({ to, label, exact = false }) => (
    <NavLink
      to={to}
      end={exact}
      className={({ isActive }) =>
        `padding-y-[10px] px-6 font-['IBM_Plex_Mono'] text-[13.5px] flex items-center gap-3 border-l-2 transition-colors ${
          isActive
            ? 'text-[#EDE6D6] bg-[rgba(237,230,214,0.06)] border-[#D89A57]'
            : 'text-[#8C8368] border-transparent hover:text-[#D8CFB8]'
        } py-2.5`
      }
    >
      <span className="w-[5px] h-[5px] rounded-full bg-current flex-shrink-0" />
      {label}
    </NavLink>
  );

  const Section = ({ title, children }) => (
    <>
      <div className="pt-5 px-6 pb-2 font-['IBM_Plex_Mono'] text-[10.5px] uppercase tracking-[0.08em] text-[#8C8368]">
        {title}
      </div>
      <div className="flex flex-col">
        {children}
      </div>
    </>
  );

  return (
    <aside className="w-[238px] bg-[#231F16] text-[#D8CFB8] flex-shrink-0 flex flex-col py-[26px]">
      <div className="flex items-center gap-2.5 font-['Fraunces'] font-bold text-[17px] px-6 pb-[26px] border-b border-[rgba(237,230,214,0.14)]">
        <span className="w-5 h-5 border-2 border-[#D89A57] rounded-full relative flex-shrink-0">
          <span className="absolute inset-1 border border-[#D89A57] rounded-full"></span>
        </span>
        VendorBridge
      </div>

      <div className="flex-1 overflow-y-auto">
        <Section title="Overview">
          <NavItem to="/dashboard" label="Dashboard" />
          {role !== 'VENDOR' && <NavItem to="/activity-logs" label="Activity & Logs" />}
        </Section>

        <Section title="Procurement">
          {role !== 'VENDOR' && <NavItem to="/vendors" label="Vendors" />}
          <NavItem to="/rfqs" label={role === 'VENDOR' ? "Open RFQs" : "RFQs"} />
          <NavItem to="/quotations" label={role === 'VENDOR' ? "My Quotations" : "Quotations"} />
          {role !== 'VENDOR' && <NavItem to="/approvals" label="Approvals" />}
          <NavItem to="/purchase-orders" label="Purchase Orders" />
          <NavItem to="/invoices" label="Invoices" />
        </Section>

        {role !== 'VENDOR' && (
          <Section title="Insights">
            <NavItem to="/reports" label="Reports & Analytics" />
          </Section>
        )}
      </div>

      <div className="mt-auto px-6 pt-[18px] border-t border-[rgba(237,230,214,0.14)] text-[12.5px]">
        <div className="flex items-center gap-2.5">
          <div className="w-[30px] h-[30px] rounded-full bg-[#8A3223] text-white flex items-center justify-center font-['IBM_Plex_Mono'] text-[12px] flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="truncate font-sans text-[13.5px] text-[#EDE6D6]">{user.name}</div>
            <div className="font-['IBM_Plex_Mono'] text-[10.5px] text-[#8C8368] uppercase truncate">
              {formatRole(role)}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
