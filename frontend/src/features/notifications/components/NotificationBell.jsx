import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead } from '../api/notificationHooks';
import { Link } from 'react-router-dom';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const { data: unreadResponse } = useUnreadCount();
  const unreadCount = unreadResponse?.data?.count || 0;

  const { data: notifResponse } = useNotifications({ limit: 5 });
  const notifications = notifResponse?.data?.notifications || [];

  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead } = useMarkAllAsRead();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = (id) => {
    markAsRead(id);
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
    <div className="relative" ref={containerRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 border-[1.5px] border-[#C9C0A8] rounded-full flex items-center justify-center relative text-[#231F16] hover:bg-[#E4DBC7] transition-colors"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="w-2 h-2 rounded-full bg-[#8A3223] absolute top-[6px] right-[8px] border border-[#F4EFE3]" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-3 w-80 bg-[#F4EFE3] border-[1.5px] border-[#231F16] shadow-lg z-50 overflow-hidden"
          >
            <div className="flex justify-between items-center px-4 py-3 border-b-[1.5px] border-[#231F16] bg-[#EDE6D6]">
              <h3 className="font-['Fraunces'] font-semibold text-[15px] text-[#231F16]">Notifications</h3>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button 
                    onClick={() => markAllAsRead()}
                    className="font-['IBM_Plex_Mono'] text-[10px] text-[#8A3223] uppercase hover:underline"
                  >
                    Mark all read
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="text-[#6b6349] hover:text-[#231F16]">
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="max-h-[300px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center font-['IBM_Plex_Mono'] text-[12px] text-[#6b6349]">
                  No new notifications.
                </div>
              ) : (
                notifications.map(notif => (
                  <div 
                    key={notif._id} 
                    className={`p-4 border-b border-[#C9C0A8] last:border-b-0 ${!notif.isRead ? 'bg-[#E4DBC7]' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-['IBM_Plex_Mono'] text-[10px] uppercase text-[#8A3223]">
                        {notif.type.replace(/_/g, ' ')}
                      </span>
                      {!notif.isRead && (
                        <button 
                          onClick={() => handleMarkAsRead(notif._id)}
                          className="text-[#6b6349] hover:text-[#4B6B4A]"
                          title="Mark as read"
                        >
                          <Check size={14} />
                        </button>
                      )}
                    </div>
                    <p className="text-[13px] text-[#231F16] leading-relaxed mb-1.5">{notif.message}</p>
                    <span className="font-['IBM_Plex_Mono'] text-[10.5px] text-[#6b6349]">
                      {timeAgo(notif.createdAt)}
                    </span>
                  </div>
                ))
              )}
            </div>
            
            <div className="p-2 border-t-[1.5px] border-[#231F16] bg-[#EDE6D6]">
              <Link 
                to="/activity-logs" 
                onClick={() => setIsOpen(false)}
                className="block w-full text-center py-2 text-[12px] font-['IBM_Plex_Mono'] text-[#4A4535] hover:text-[#8A3223] transition-colors"
              >
                View All Notifications →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
