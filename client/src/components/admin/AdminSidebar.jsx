import React from 'react';
import { 
  LayoutDashboard, Users, Building2, Layers, 
  ClipboardList, Activity, Settings, ShieldCheck,
  Shield, ChevronRight
} from 'lucide-react';

const AdminSidebar = ({ activeTab, setActiveTab, user }) => {
  const menuGroups = [
    {
      title: "MAIN",
      items: [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard }
      ]
    },
    {
      title: "MANAGEMENT",
      items: [
        { id: "users", label: "Users", icon: Users },
        { id: "orgs", label: "Organizations", icon: Building2 },
        { id: "workspaces", label: "Workspaces", icon: Layers }
      ]
    },
    {
      title: "MONITORING",
      items: [
        { id: "audit", label: "Audit Logs", icon: ClipboardList },
        { id: "activity", label: "System Activity", icon: Activity }
      ]
    },
    {
      title: "SYSTEM",
      items: [
        { id: "settings", label: "Platform Settings", icon: Settings },
        { id: "security", label: "Security", icon: ShieldCheck }
      ]
    }
  ];

  return (
    <div className="w-[260px] h-full bg-[#0a0c10] border-r border-[#ffffff]/5 flex flex-col shrink-0">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center gap-3 mb-2 cursor-pointer" onClick={() => window.location.href = "/organization"}>
          <div className="h-8 w-8 bg-purple-600/20 text-purple-500 rounded-lg flex items-center justify-center shrink-0">
            <Shield size={18} />
          </div>
          <h1 className="text-white font-bold tracking-wide">Platform Admin</h1>
        </div>
        <p className="text-slate-500 text-xs leading-relaxed mt-3">
          Manage users, organizations, workspaces and system settings.
        </p>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6">
        {menuGroups.map((group, idx) => (
          <div key={idx}>
            <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2 px-2">
              {group.title}
            </h3>
            <div className="space-y-1">
              {group.items.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive 
                        ? "bg-purple-500/10 text-purple-400" 
                        : "text-slate-400 hover:text-white hover:bg-[#1c1f2e]"
                    }`}
                  >
                    <Icon size={16} className={isActive ? "text-purple-400" : "text-slate-500"} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer User Profile */}
      <div className="p-4 border-t border-[#ffffff]/5 mt-auto">
        <div 
          onClick={() => window.location.href = "/profile"}
          className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#1c1f2e] transition-colors cursor-pointer"
        >
          <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold shrink-0 overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              (user?.username?.charAt(0) || "A").toUpperCase()
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-sm font-bold truncate">{user?.username || "Admin"}</div>
            <div className="text-slate-500 text-xs truncate">Platform Admin</div>
          </div>
          <ChevronRight size={16} className="text-slate-600" />
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
