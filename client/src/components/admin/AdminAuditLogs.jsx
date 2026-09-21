import React from 'react';
import { ClipboardList, Search, ChevronDown, Wrench, Calendar as CalendarIcon, Filter } from 'lucide-react';

const AdminAuditLogs = () => {
  return (
    <div className="flex flex-col h-full overflow-y-auto w-full max-w-7xl mx-auto p-4 md:p-6 pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <ClipboardList className="text-purple-500" size={28} /> Audit Logs
        </h1>
        <p className="text-slate-400 text-sm">Track platform-wide actions, configuration changes, and security events.</p>
      </div>

      <div className="bg-[#1c1f2e] border border-[#ffffff]/5 rounded-xl flex flex-col shadow-lg flex-1 min-h-[500px]">
        {/* Toolbar */}
        <div className="p-5 border-b border-[#ffffff]/5 flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#1c1f2e] rounded-t-xl shrink-0 opacity-50 pointer-events-none">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Search actor, action, or target..." 
              disabled
              className="w-full bg-[#0f111a] border border-slate-800 text-sm rounded-lg pl-9 pr-4 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors placeholder:text-slate-600"
            />
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-40">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"><Filter size={14}/></div>
              <select
                disabled
                className="w-full bg-[#0f111a] border border-slate-800 text-sm rounded-lg pl-8 pr-8 py-2 text-white appearance-none focus:outline-none transition-colors"
              >
                <option>All Actions</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
            </div>
            <div className="relative w-full sm:w-40">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"><CalendarIcon size={14}/></div>
              <select
                disabled
                className="w-full bg-[#0f111a] border border-slate-800 text-sm rounded-lg pl-8 pr-8 py-2 text-white appearance-none focus:outline-none transition-colors"
              >
                <option>Last 7 Days</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
            </div>
          </div>
        </div>

        {/* Table Content (Empty State) */}
        <div className="overflow-x-auto flex-1 flex flex-col relative">
          <table className="w-full text-left border-collapse min-w-[800px] opacity-20 pointer-events-none">
            <thead>
              <tr className="border-b border-[#ffffff]/5 text-slate-500 text-[10px] font-bold uppercase tracking-wider bg-[#0f111a]">
                <th className="p-4 pl-6">Actor</th>
                <th className="p-4 w-1/3">Action & Target</th>
                <th className="p-4 w-40">IP Address</th>
                <th className="p-4 pr-6 w-40 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ffffff]/5">
              {[...Array(6)].map((_, i) => (
                <tr key={i}>
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-slate-800"></div>
                      <div className="h-4 w-20 bg-slate-800 rounded"></div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="h-4 w-full max-w-[200px] bg-slate-800 rounded mb-1"></div>
                    <div className="h-3 w-32 bg-slate-800/50 rounded"></div>
                  </td>
                  <td className="p-4"><div className="h-4 w-24 bg-slate-800 rounded"></div></td>
                  <td className="p-4 pr-6 text-right"><div className="h-4 w-24 bg-slate-800 rounded ml-auto"></div></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1c1f2e]/80 backdrop-blur-sm z-10 rounded-b-xl">
            <div className="bg-[#0f111a] border border-[#ffffff]/10 rounded-2xl p-8 max-w-md text-center shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto mb-4 border border-purple-500/20 shadow-lg shadow-purple-500/5">
                <Wrench size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Pending Implementation</h3>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                The Audit Logs viewer is designed and ready, but the platform does not yet have an active audit logging backend service tracking these events.
              </p>
              <button className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors border border-slate-700 cursor-default">
                Awaiting Backend
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAuditLogs;
