import { useState, useEffect, useRef } from "react";
import { Bell, Check, CircleAlert, MailOpen } from "lucide-react";
import { 
  getNotifications, 
  getUnreadCount, 
  markAsRead, 
  markAllAsRead 
} from "../../services/notificationService";
import { useNavigate } from "react-router-dom";

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchUnreadCount = async () => {
    try {
      const res = await getUnreadCount();
      if (res.success) setUnreadCount(res.count);
    } catch (err) {
      console.error("Failed to fetch unread count", err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications();
      if (res.success) setNotifications(res.data);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    // Poll every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    const closeDropdown = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", closeDropdown);
    return () => document.removeEventListener("mousedown", closeDropdown);
  }, []);

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await markAsRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
    
    // Navigate based on metadata
    if (notification.type === "INVITATION") {
      setIsOpen(false);
      navigate("/invitations");
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        className="relative cursor-pointer" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell
          size={20}
          className={`transition-transform hover:scale-110 ${isOpen ? 'text-violet-400' : 'text-slate-400 hover:text-slate-200'} hidden md:block`}
        />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 hidden h-4 min-w-[16px] px-1 flex items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-[#111827] md:flex">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </div>

      {isOpen && (
        <div className="absolute right-0 top-10 w-80 overflow-hidden rounded-xl border border-slate-700 bg-slate-800 shadow-xl z-50">
          <div className="flex items-center justify-between border-b border-slate-700 px-4 py-3 bg-slate-800/80">
            <h3 className="text-sm font-semibold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors"
              >
                <Check size={14} /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[360px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center flex flex-col items-center gap-2">
                <MailOpen size={32} className="text-slate-600" />
                <p className="text-sm text-slate-400">You're all caught up!</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`flex items-start gap-3 border-b border-slate-700/50 p-4 transition-colors hover:bg-slate-700/50 cursor-pointer ${notif.isRead ? 'opacity-70' : 'bg-slate-800'}`}
                >
                  <div className={`mt-0.5 shrink-0 rounded-full p-1.5 ${notif.isRead ? 'bg-slate-700 text-slate-400' : 'bg-violet-500/20 text-violet-400'}`}>
                    <CircleAlert size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${notif.isRead ? 'text-slate-300' : 'text-white font-medium'} leading-tight mb-1`}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {notif.message}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-500">
                      {formatTimeAgo(notif.createdAt)}
                    </p>
                  </div>
                  {!notif.isRead && (
                    <div 
                      className="shrink-0 w-2 h-2 rounded-full bg-violet-500 mt-2" 
                      title="Unread"
                    />
                  )}
                </div>
              ))
            )}
          </div>
          <div className="border-t border-slate-700 p-2 bg-slate-800/80 text-center">
            <span className="text-xs text-slate-400 cursor-pointer hover:text-white transition-colors">View all notifications</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
