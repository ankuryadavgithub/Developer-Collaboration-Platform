import React from 'react';
import { ShieldCheck, MonitorSmartphone, KeyRound, Lock, Wrench } from 'lucide-react';

const AdminSecurity = () => {
  return (
    <div className="flex flex-col h-full overflow-y-auto w-full max-w-5xl mx-auto p-4 md:p-6 pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <ShieldCheck className="text-emerald-500" size={28} /> Security Overview
        </h1>
        <p className="text-slate-400 text-sm">Monitor platform security and manage authentication policies.</p>
      </div>

      <div className="space-y-6">
        
        {/* Pending Banner */}
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 flex gap-4 items-start shadow-lg">
          <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
            <Wrench size={16} />
          </div>
          <div>
            <h3 className="text-purple-400 font-bold text-sm">UI Structure Ready - Pending Backend Integration</h3>
            <p className="text-slate-400 text-xs mt-1 leading-relaxed">
              This security dashboard is structured according to the redesign specifications. Features like active session management, 
              MFA enforcement, and detailed login history require corresponding backend endpoints to be fully operational.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Active Sessions */}
          <div className="bg-[#1c1f2e] border border-[#ffffff]/5 rounded-xl shadow-lg flex flex-col h-[350px]">
            <div className="p-5 border-b border-[#ffffff]/5 flex items-center justify-between bg-[#0f111a]/50">
              <div className="flex items-center gap-2">
                <MonitorSmartphone className="text-blue-400" size={18} />
                <h2 className="text-base font-bold text-white">Active Sessions</h2>
              </div>
              <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded text-xs font-bold">Mock Data</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 opacity-50 pointer-events-none">
              <div className="p-3 border-b border-[#ffffff]/5">
                <div className="flex justify-between items-start mb-1">
                  <div className="text-white text-sm font-bold">Admin (SuperAdmin)</div>
                  <div className="text-xs text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-medium">Current</div>
                </div>
                <div className="text-xs text-slate-400">Windows • Chrome 116</div>
                <div className="text-xs text-slate-500 mt-1">192.168.1.1 • Signed in 2h ago</div>
              </div>
              
              <div className="p-3 border-b border-[#ffffff]/5">
                <div className="flex justify-between items-start mb-1">
                  <div className="text-white text-sm font-bold">Test_101</div>
                </div>
                <div className="text-xs text-slate-400">Mac OS • Safari</div>
                <div className="text-xs text-slate-500 mt-1">10.0.0.45 • Signed in 1d ago</div>
              </div>
            </div>
          </div>

          {/* Security Policies */}
          <div className="bg-[#1c1f2e] border border-[#ffffff]/5 rounded-xl shadow-lg flex flex-col h-[350px]">
            <div className="p-5 border-b border-[#ffffff]/5 flex items-center justify-between bg-[#0f111a]/50">
              <div className="flex items-center gap-2">
                <Lock className="text-emerald-400" size={18} />
                <h2 className="text-base font-bold text-white">Security Policies</h2>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-5 opacity-50 pointer-events-none">
              
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2 flex justify-between">
                  <span>Session Timeout (Minutes)</span>
                  <span className="text-emerald-400 text-xs">Default: 120</span>
                </label>
                <input 
                  type="number" 
                  defaultValue={120}
                  className="w-full bg-[#0f111a] border border-slate-700 text-sm rounded-lg px-4 py-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2 flex justify-between">
                  <span>Max Login Attempts</span>
                  <span className="text-emerald-400 text-xs">Default: 5</span>
                </label>
                <input 
                  type="number" 
                  defaultValue={5}
                  className="w-full bg-[#0f111a] border border-slate-700 text-sm rounded-lg px-4 py-2.5 text-white"
                />
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Accounts will be temporarily locked for 15 minutes after exceeding this threshold.
                </p>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminSecurity;
