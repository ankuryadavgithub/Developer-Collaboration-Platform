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
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", closeDropdown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", closeDropdown);
      document.removeEventListener("keydown", handleKeyDown);
    };
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
    
    setIsOpen(false);

    // Navigate based on metadata
    if (notification.type === "INVITATION") {
      navigate("/invitations");
    } else if (notification.type === "SYSTEM" && notification.title === "Invitation Accepted") {
      // If someone accepted, maybe take the inviter to the org members page
      if (notification.metadata?.organizationId) {
        navigate(`/organization/${notification.metadata.organizationId}`);
      }
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
      <button 
        type="button"
        className="relative flex items-center justify-center p-2 rounded-lg hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="View notifications"
        aria-expanded={isOpen}
      >
        <Bell
          size={20}
          className={`transition-transform hover:scale-110 ${isOpen ? 'text-violet-400' : 'text-slate-400 hover:text-slate-200'} hidden md:block`}
        />
        {/* Added mobile visible bell icon since the other is md:block */}
        <Bell
          size={20}
          className={`md:hidden ${isOpen ? 'text-violet-400' : 'text-white'}`}
        />
        {unreadCount > 0 && (
          <span className="absolute right-0 top-0 h-4 min-w-[16px] px-1 flex items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-[#111827]">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div 
          className="absolute right-[-60px] sm:right-0 top-12 w-[320px] overflow-hidden rounded-xl border border-slate-700 bg-slate-800 shadow-2xl z-50 transform origin-top-right transition-all"
          role="menu"
          aria-label="Notifications"
        >
          <div className="flex items-center justify-between border-b border-slate-700 px-4 py-3 bg-slate-800/90 backdrop-blur-sm">
            <h3 className="text-sm font-semibold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                className="text-xs font-medium text-violet-400 hover:text-violet-300 focus:outline-none focus:underline flex items-center gap-1 transition-colors"
                aria-label="Mark all notifications as read"
              >
                <Check size={14} /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[360px] overflow-y-auto overscroll-contain">
            {notifications.length === 0 ? (
              <div className="px-4 py-10 text-center flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-slate-700/50 rounded-full flex items-center justify-center text-slate-500">
                  <MailOpen size={24} />
                </div>
                <p className="text-sm font-medium text-slate-300">You're all caught up!</p>
                <p className="text-xs text-slate-500">No new notifications right now.</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  role="menuitem"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleNotificationClick(notif); }}
                  className={`flex items-start gap-3 border-b border-slate-700/50 p-4 transition-colors hover:bg-slate-700 focus:bg-slate-700 focus:outline-none cursor-pointer ${notif.isRead ? 'opacity-70 bg-slate-800' : 'bg-slate-800/80'}`}
                >
                  <div className={`mt-0.5 shrink-0 rounded-full p-2 ${notif.isRead ? 'bg-slate-700 text-slate-400' : 'bg-violet-500/20 text-violet-400 ring-1 ring-violet-500/30'}`}>
                    <CircleAlert size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${notif.isRead ? 'text-slate-300' : 'text-slate-100 font-semibold'} leading-tight mb-1`}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                    <p className="mt-2 text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                      {formatTimeAgo(notif.createdAt)}
                    </p>
                  </div>
                  {!notif.isRead && (
                    <div 
                      className="shrink-0 w-2.5 h-2.5 rounded-full bg-violet-500 mt-2 shadow-[0_0_8px_rgba(139,92,246,0.5)]" 
                      title="Unread"
                      aria-label="Unread notification"
                    />
                  )}
                </div>
              ))
            )}
          </div>
          <div className="border-t border-slate-700 p-3 bg-slate-800/90 text-center hover:bg-slate-700 transition-colors cursor-pointer">
            <span className="text-xs font-semibold text-slate-300">View all notifications</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
