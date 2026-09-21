import React from 'react';
import { 
  Users, Building2, Layers, Mail, 
  UserPlus, ShieldAlert, Globe, Database, GitBranch, Settings, ClipboardList
} from 'lucide-react';

const AdminOverview = ({ user }) => {
  return (
    <div className="flex flex-col h-full overflow-y-auto w-full max-w-7xl mx-auto p-4 md:p-6 pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">Dashboard</h1>
        <p className="text-slate-400">Welcome back, <span className="text-purple-400 font-medium">{user?.username || "SuperAdmin"}</span></p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#1c1f2e] border border-[#ffffff]/5 rounded-xl p-5 shadow-lg flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div className="h-12 w-12 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
              <Users size={24} />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white leading-none">8</div>
            </div>
          </div>
          <div>
            <div className="text-slate-400 text-sm font-medium">Total Users</div>
            <div className="text-emerald-400 text-xs mt-1 font-medium flex items-center gap-1">↑ 2 this week</div>
          </div>
        </div>

        <div className="bg-[#1c1f2e] border border-[#ffffff]/5 rounded-xl p-5 shadow-lg flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div className="h-12 w-12 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
              <Building2 size={24} />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white leading-none">4</div>
            </div>
          </div>
          <div>
            <div className="text-slate-400 text-sm font-medium">Organizations</div>
            <div className="text-emerald-400 text-xs mt-1 font-medium flex items-center gap-1">↑ 1 this week</div>
          </div>
        </div>

        <div className="bg-[#1c1f2e] border border-[#ffffff]/5 rounded-xl p-5 shadow-lg flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div className="h-12 w-12 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Layers size={24} />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white leading-none">17</div>
            </div>
          </div>
          <div>
            <div className="text-slate-400 text-sm font-medium">Workspaces</div>
            <div className="text-emerald-400 text-xs mt-1 font-medium flex items-center gap-1">↑ 3 this week</div>
          </div>
        </div>

        <div className="bg-[#1c1f2e] border border-[#ffffff]/5 rounded-xl p-5 shadow-lg flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div className="h-12 w-12 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0">
              <Mail size={24} />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white leading-none">3</div>
            </div>
          </div>
          <div className="flex justify-between items-end">
            <div className="text-slate-400 text-sm font-medium">Pending Invitations</div>
            <div className="text-orange-400 text-xs font-medium cursor-pointer hover:underline">View all →</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-[#1c1f2e] border border-[#ffffff]/5 rounded-xl shadow-lg flex flex-col">
          <div className="p-5 border-b border-[#ffffff]/5 flex justify-between items-center">
            <h2 className="text-lg font-bold text-white">Recent Activity</h2>
            <button className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors">View all</button>
          </div>
          <div className="flex-1 p-5 overflow-y-auto">
            <div className="space-y-6">
              
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                  <UserPlus size={18} />
                </div>
                <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="text-sm text-slate-300"><span className="text-white font-bold">Test_101</span> registered</div>
                    <div className="text-xs text-slate-500">New user joined the platform</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-md bg-[#2a2e40] text-slate-300 text-[10px] font-bold uppercase">User</span>
                    <span className="text-xs text-slate-500 w-12 text-right">2m ago</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <Building2 size={18} />
                </div>
                <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="text-sm text-slate-300"><span className="text-white font-bold">Test4_Org</span> organization created</div>
                    <div className="text-xs text-slate-500">New organization was created</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-md bg-[#2a2e40] text-slate-300 text-[10px] font-bold uppercase">Organization</span>
                    <span className="text-xs text-slate-500 w-12 text-right">8m ago</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Layers size={18} />
                </div>
                <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="text-sm text-slate-300"><span className="text-white font-bold">Ankur</span> changed workspace role</div>
                    <div className="text-xs text-slate-500">Changed role of Test_106 in Dev Team</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-md bg-[#2a2e40] text-slate-300 text-[10px] font-bold uppercase">Workspace</span>
                    <span className="text-xs text-slate-500 w-12 text-right">15m ago</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                  <Mail size={18} />
                </div>
                <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="text-sm text-slate-300"><span className="text-white font-bold">Invitation</span> sent to user</div>
                    <div className="text-xs text-slate-500">Invitation sent to test.user@gmail.com</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-md bg-orange-500/10 text-orange-400 text-[10px] font-bold uppercase">Invitation</span>
                    <span className="text-xs text-slate-500 w-12 text-right">33m ago</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                  <Settings size={18} />
                </div>
                <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="text-sm text-slate-300"><span className="text-white font-bold">Platform settings</span> updated</div>
                    <div className="text-xs text-slate-500">Public signups setting changed</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-md bg-[#2a2e40] text-slate-300 text-[10px] font-bold uppercase">Settings</span>
                    <span className="text-xs text-slate-500 w-12 text-right">1h ago</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-[#1c1f2e] border border-[#ffffff]/5 rounded-xl shadow-lg flex flex-col">
          <div className="p-5 border-b border-[#ffffff]/5 flex justify-between items-center">
            <h2 className="text-lg font-bold text-white">System Status</h2>
            <button className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors">View details</button>
          </div>
          <div className="p-5 space-y-6">
            
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#0f111a] border border-[#ffffff]/10 flex items-center justify-center shrink-0 text-emerald-400">
                <Globe size={18} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-0.5">
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> API
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Operational</span>
                </div>
                <div className="text-xs text-slate-500">All systems operational</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#0f111a] border border-[#ffffff]/10 flex items-center justify-center shrink-0 text-blue-400">
                <Database size={18} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-0.5">
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Database
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Operational</span>
                </div>
                <div className="text-xs text-slate-500">All systems operational</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#0f111a] border border-[#ffffff]/10 flex items-center justify-center shrink-0 text-purple-400">
                <GitBranch size={18} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-0.5">
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> GitHub Integration
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Operational</span>
                </div>
                <div className="text-xs text-slate-500">All systems operational</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#0f111a] border border-[#ffffff]/10 flex items-center justify-center shrink-0 text-orange-400">
                <Mail size={18} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-0.5">
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Email Service
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Operational</span>
                </div>
                <div className="text-xs text-slate-500">All systems operational</div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Footer Info Strip */}
      <div className="bg-[#1c1f2e] border border-[#ffffff]/5 rounded-xl p-5 flex flex-wrap gap-8 items-center justify-between shadow-lg">
        <div>
          <div className="text-white font-bold mb-1">Platform Overview</div>
          <div className="text-slate-500 text-xs">All times shown in your local timezone.</div>
        </div>
        <div className="flex gap-8 overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
          <div className="flex items-center gap-3">
            <Users size={16} className="text-blue-400" />
            <div>
              <div className="text-white font-bold leading-none">8</div>
              <div className="text-slate-500 text-[10px] uppercase tracking-wider mt-1">Total Users</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ShieldAlert size={16} className="text-orange-400" />
            <div>
              <div className="text-white font-bold leading-none">1</div>
              <div className="text-slate-500 text-[10px] uppercase tracking-wider mt-1">Platform Admin</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Building2 size={16} className="text-blue-400" />
            <div>
              <div className="text-white font-bold leading-none">4</div>
              <div className="text-slate-500 text-[10px] uppercase tracking-wider mt-1">Organizations</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Layers size={16} className="text-emerald-400" />
            <div>
              <div className="text-white font-bold leading-none">17</div>
              <div className="text-slate-500 text-[10px] uppercase tracking-wider mt-1">Workspaces</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Users size={16} className="text-purple-400" />
            <div>
              <div className="text-white font-bold leading-none">31</div>
              <div className="text-slate-500 text-[10px] uppercase tracking-wider mt-1">Total Members</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Mail size={16} className="text-orange-400" />
            <div>
              <div className="text-white font-bold leading-none">3</div>
              <div className="text-slate-500 text-[10px] uppercase tracking-wider mt-1">Pending Invitations</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ClipboardList size={16} className="text-purple-400" />
            <div>
              <div className="text-white font-bold leading-none">128</div>
              <div className="text-slate-500 text-[10px] uppercase tracking-wider mt-1">Audit Logs</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
