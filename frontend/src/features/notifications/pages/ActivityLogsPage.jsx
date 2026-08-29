import React, { useState } from 'react';
import { Download, Mail, Plus, X, Check, FileText } from 'lucide-react';
import useAuthStore from '../../../store/useAuthStore';
import { useActivityLogs } from '../api/notificationHooks';
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '../api/notificationHooks';

const ActivityLogsPage = () => {
  const { user } = useAuthStore();
  const role = user?.role?.toUpperCase();
  const isVendor = role === 'VENDOR';

  const [activeFilter, setActiveFilter] = useState('All activity');
  const [page, setPage] = useState(1);

  // Fetch Activity Logs (Skip for vendors)
  const { data: logsData, isLoading: logsLoading } = useActivityLogs({ 
    page, 
    limit: 15,
    ...(activeFilter !== 'All activity' && { entityType: activeFilter.toUpperCase().replace(/S$/, '') }) 
  });
  
  // Fetch Notifications
  const { data: notifData } = useNotifications({ page: 1, limit: 10 });
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead } = useMarkAllAsRead();

  const logs = logsData?.data?.logs || [];
  const notifications = notifData?.data?.notifications || [];
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filters = ['All activity', 'RFQs', 'Approvals', 'Invoices', 'Vendors'];

  const getLogIcon = (action) => {
    if (action.includes('APPROVED')) return <span className="w-[30px] h-[30px] rounded-full bg-[rgba(75,107,74,0.15)] text-[#4B6B4A] flex items-center justify-center flex-shrink-0"><Check size={14} /></span>;
    if (action.includes('REJECTED')) return <span className="w-[30px] h-[30px] rounded-full bg-[rgba(138,50,35,0.12)] text-[#8A3223] flex items-center justify-center flex-shrink-0"><X size={14} /></span>;
    if (action.includes('SENT')) return <span className="w-[30px] h-[30px] rounded-full bg-[rgba(156,122,46,0.15)] text-[#9C7A2E] flex items-center justify-center flex-shrink-0"><Mail size={14} /></span>;
    return <span className="w-[30px] h-[30px] rounded-full bg-[rgba(35,31,22,0.08)] text-[#4A4535] flex items-center justify-center flex-shrink-0"><Plus size={14} /></span>;
  };

  const formatActionStr = (actionStr) => {
    return actionStr.replace(/_/g, ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase());
  };

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  return (
    <div className="p-9 max-w-[1200px] mx-auto">
      <div className="mb-8">
        <h1 className="font-['Fraunces'] font-semibold text-[26px] text-[#231F16]">
          {isVendor ? 'Notifications' : 'Activity & Notifications'}
        </h1>
        {!isVendor && (
          <div className="font-['IBM_Plex_Mono'] text-[11.5px] text-[#6b6349] mt-1 tracking-wide uppercase">
            FULL AUDIT TRAIL · LAST 30 DAYS
          </div>
        )}
      </div>

      <div className={`grid gap-6 items-start ${isVendor ? 'grid-cols-1 max-w-[500px]' : 'grid-cols-[1fr_320px]'}`}>
        
        {/* Activity Logs (Hidden for vendors) */}
        {!isVendor && (
          <div>
            <div className="flex gap-2.5 mb-5 flex-wrap">
              {filters.map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`border-[1.5px] px-3.5 py-1.5 font-['IBM_Plex_Mono'] text-[12px] rounded-full transition-colors ${
                    activeFilter === f 
                      ? 'border-[#8A3223] text-[#8A3223] bg-[#F4EFE3]' 
                      : 'border-[#C9C0A8] text-[#6b6349] hover:border-[#8A3223] hover:text-[#8A3223]'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="border-[1.5px] border-[#231F16] bg-[#F4EFE3] rounded-sm">
              {logsLoading ? (
                <div className="p-8 text-center text-[#6b6349] font-['IBM_Plex_Mono'] text-[13px]">Loading logs...</div>
              ) : logs.length === 0 ? (
                <div className="p-8 text-center text-[#6b6349] font-['IBM_Plex_Mono'] text-[13px]">No activity found.</div>
              ) : (
                logs.map(log => (
                  <div key={log._id} className="grid grid-cols-[85px_1fr_130px] gap-3.5 p-4 border-b border-[#C9C0A8] last:border-b-0 items-start">
                    <span className="font-['IBM_Plex_Mono'] text-[11px] text-[#6b6349] mt-1">
                      {formatTime(log.createdAt)}
                    </span>
                    <div className="flex gap-3 items-start">
                      {getLogIcon(log.action)}
                      <div>
                        <h4 className="text-[13.5px] font-semibold text-[#231F16] mb-0.5">{formatActionStr(log.action)}</h4>
                        <p className="text-[12.5px] text-[#6b6349]">{log.entityId} — {log.entityType}</p>
                      </div>
                    </div>
                    <span className="font-['IBM_Plex_Mono'] text-[11px] text-[#4A4535] text-right mt-1">
                      by {log.actorId?.name || 'System'}
                    </span>
                  </div>
                ))
              )}
            </div>
            
            {logsData?.data?.pagination?.pages > 1 && (
              <div className="mt-6 flex justify-between items-center font-['IBM_Plex_Mono'] text-[12px]">
                <button 
                  disabled={page === 1} 
                  onClick={() => setPage(p => p - 1)}
                  className="disabled:opacity-50 text-[#8A3223] hover:underline"
                >
                  ← Newer
                </button>
                <span className="text-[#6b6349]">Page {page} of {logsData.data.pagination.pages}</span>
                <button 
                  disabled={page >= logsData.data.pagination.pages} 
                  onClick={() => setPage(p => p + 1)}
                  className="disabled:opacity-50 text-[#8A3223] hover:underline"
                >
                  Older →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Right Sidebar: Notifications & Export */}
        <div className="flex flex-col gap-5">
          <div className="border-[1.5px] border-[#231F16] bg-[#F4EFE3] rounded-sm">
            <div className="p-3.5 px-5 border-b-[1.5px] border-[#231F16] flex justify-between items-center bg-[#EDE6D6]">
              <h3 className="font-['Fraunces'] font-semibold text-[15px] text-[#231F16]">Notifications</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={() => markAllAsRead()}
                  className="font-['IBM_Plex_Mono'] text-[11px] text-[#8A3223] uppercase hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-[500px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center font-['IBM_Plex_Mono'] text-[12px] text-[#6b6349]">
                  No new notifications.
                </div>
              ) : (
                notifications.map(notif => (
                  <div key={notif._id} className={`p-4 px-5 border-b border-[#C9C0A8] last:border-b-0 ${!notif.isRead ? 'bg-[#E4DBC7]' : ''}`}>
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-['IBM_Plex_Mono'] text-[10px] uppercase text-[#8A3223] tracking-wide block mb-1">
                        {notif.type.replace(/_/g, ' ')}
                      </span>
                      {!notif.isRead && (
                        <button 
                          onClick={() => markAsRead(notif._id)}
                          className="text-[#6b6349] hover:text-[#4B6B4A]"
                          title="Mark as read"
                        >
                          <Check size={14} />
                        </button>
                      )}
                    </div>
                    <p className="text-[12.5px] text-[#4A4535] leading-relaxed">{notif.message}</p>
                    <span className="font-['IBM_Plex_Mono'] text-[10.5px] text-[#6b6349] mt-1.5 block">
                      {timeAgo(notif.createdAt)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {!isVendor && (
            <div className="border-[1.5px] border-[#231F16] bg-[#F4EFE3] rounded-sm">
              <div className="p-3.5 px-5 border-b-[1.5px] border-[#231F16] bg-[#EDE6D6]">
                <h3 className="font-['Fraunces'] font-semibold text-[15px] text-[#231F16]">Export</h3>
              </div>
              <div className="p-4 px-5 text-[12.5px] text-[#6b6349]">
                Download the full audit log as CSV or PDF for compliance review.
                <div className="mt-3 flex gap-2">
                  <button className="flex-1 p-2 border-[1.5px] border-[#231F16] bg-transparent font-['IBM_Plex_Mono'] text-[11.5px] text-[#231F16] hover:bg-[#E4DBC7] flex justify-center items-center gap-2">
                    <FileText size={14} /> CSV
                  </button>
                  <button className="flex-1 p-2 border-[1.5px] border-[#231F16] bg-transparent font-['IBM_Plex_Mono'] text-[11.5px] text-[#231F16] hover:bg-[#E4DBC7] flex justify-center items-center gap-2">
                    <Download size={14} /> PDF
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityLogsPage;
