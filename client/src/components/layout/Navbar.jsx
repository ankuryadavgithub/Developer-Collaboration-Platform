import { Search, Bell, Menu, MessageCircle, LogOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigationLoading } from "../../context/NavigationLoadingContext.jsx";
import githubIcon from "/src/assets/github.svg";
import { logout } from "../../services/googleAuthService.js";

const Navbar = ({ toggleSidebar, githubData }) => {
  const { goTo } = useNavigationLoading();
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  
  // Notification State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const username = user?.username || "User";
  const avatar = user?.avatar;
  const userInitial = username.charAt(0).toUpperCase();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      localStorage.removeItem("user");
      goTo("/login", { replace: true });
    }
  };

  // Fetch Notifications on load
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const countRes = await axios.get("http://localhost:5000/api/notifications/unread-count", { withCredentials: true });
        setUnreadCount(countRes.data.count);

        const notifRes = await axios.get("http://localhost:5000/api/notifications?limit=5", { withCredentials: true });
        setNotifications(notifRes.data.data);
      } catch (err) {
        console.error("Failed to fetch notifications");
      }
    };
    if (user) {
      fetchNotifications();
    }
  }, []);

  // Mark single notification as read
  const markAsRead = async (id) => {
    try {
      await axios.patch(`http://localhost:5000/api/notifications/${id}/read`, {}, { withCredentials: true });
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await axios.patch("http://localhost:5000/api/notifications/read-all", {}, { withCredentials: true });
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle clicking outside of dropdowns
  useEffect(() => {
    const closeDropdown = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsProfileMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target)) setIsNotificationMenuOpen(false);
    };
    document.addEventListener("mousedown", closeDropdown);
    return () => document.removeEventListener("mousedown", closeDropdown);
  }, []);

  return (
    <div className="sticky top-0 z-40 flex items-center justify-between gap-2 rounded-2xl border-b border-slate-800 bg-[#111827] px-4 py-2 text-white md:gap-4 md:px-8">
      <div className="flex flex-shrink-0 items-center gap-4">
        <button className="rounded-lg bg-[#1c1f2e] p-2 text-white transition-colors hover:bg-[#2a2e45] md:hidden" onClick={toggleSidebar}>
          <Menu size={20} />
        </button>

        <div>
          <h2 className="hidden text-[18px] font-semibold tracking-tight text-slate-100 sm:block">Dashboard</h2>
          <p className="mt-1 hidden text-[12px] text-slate-400 lg:block">
            Welcome back, {username}! Here&apos;s what&apos;s happening with your projects.
          </p>
        </div>
      </div>

      <div className="mx-2 hidden max-w-xl flex-1 sm:block md:mx-8">
        <search className="group relative block">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-violet-400" />
          <input type="text" placeholder="Search projects, repositories, files..." className="w-full rounded-lg border border-slate-700 bg-slate-800/80 py-3 pl-10 pr-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20" />
        </search>
      </div>

      <div className="flex flex-shrink-0 items-center gap-3 md:gap-4">
        
        {/* Regular Bell Icon */}
        <Bell size={20} className="hidden cursor-pointer text-slate-400 transition-transform duration-300 hover:scale-110 hover:text-slate-200 md:block" />

        {/* === NOTIFICATION MESSAGE CIRCLE === */}
        <div className="relative" ref={notifRef}>
          <div onClick={() => setIsNotificationMenuOpen(!isNotificationMenuOpen)}>
            <MessageCircle size={20} className="hidden cursor-pointer text-slate-400 transition-transform hover:scale-110 hover:text-slate-200 md:block" />
            {unreadCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 hidden h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold items-center justify-center text-white ring-2 ring-[#111827] md:flex">
                {unreadCount}
              </span>
            )}
          </div>

          {/* === NOTIFICATION DROPDOWN === */}
          {isNotificationMenuOpen && (
            <div className="absolute right-0 top-10 w-80 overflow-hidden rounded-xl border border-slate-700 bg-slate-800 shadow-xl z-50">
              <div className="flex justify-between items-center px-4 py-3 border-b border-slate-700 bg-[#1c1f2e]">
                <h3 className="text-sm font-semibold text-white">Messages</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-xs font-medium text-violet-400 hover:text-violet-300">Mark all as read</button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="p-6 text-center text-sm text-slate-400">You're all caught up!</p>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => !n.isRead && markAsRead(n.id)}
                      className={`px-4 py-3 border-b border-slate-700/50 cursor-pointer transition-colors ${n.isRead ? 'opacity-60' : 'bg-slate-700/30 hover:bg-slate-700/60'}`}
                    >
                      <p className="text-sm font-medium text-slate-200">{n.title}</p>
                      <p className="text-xs text-slate-400 mt-1">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {!githubData && (
          <div onClick={() => window.location.href = "http://localhost:5000/api/auth/github?action=connect"} className="flex h-5 w-5 cursor-pointer items-center justify-center font-medium transition-transform duration-300 hover:scale-110" title="Connect your GitHub account">
            <img src={githubIcon} alt="GitHub" className="invert opacity-70 transition-opacity hover:opacity-100" />
          </div>
        )}

        <div className="relative" ref={dropdownRef}>
          <button type="button" onClick={() => setIsProfileMenuOpen((isOpen) => !isOpen)} className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-violet-600 font-semibold text-white transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-violet-400" aria-label="Open profile menu">
            {avatar && !imageFailed ? <img src={avatar} alt={`${username}'s profile`} className="h-full w-full object-cover" onError={() => setImageFailed(true)} /> : userInitial}
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 top-12 w-48 overflow-hidden rounded-xl border border-slate-700 bg-slate-800 py-1 shadow-xl z-50">
              <div className="border-b border-slate-700 px-4 py-3">
                <p className="truncate text-sm font-semibold text-white">{username}</p>
                <p className="truncate text-xs text-slate-400">{user?.email}</p>
              </div>
              <button type="button" onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-red-400 transition-colors hover:bg-slate-700 hover:text-red-300">
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;