import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Layers, Search, ChevronDown, Wrench, Building2, User } from 'lucide-react';

const AdminWorkspaces = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchWorkspaces = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/admin/workspaces?page=${page}&limit=10&search=${search}`,
        { withCredentials: true }
      );
      setWorkspaces(response.data.data.workspaces);
      setTotalPages(response.data.data.pagination.totalPages);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch workspaces");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(fetchWorkspaces, 500);
    return () => clearTimeout(delay);
  }, [page, search]);

  return (
    <div className="flex flex-col h-full overflow-y-auto w-full max-w-7xl mx-auto p-4 md:p-6 pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Layers className="text-emerald-500" size={28} /> Workspaces
        </h1>
        <p className="text-slate-400 text-sm">Global overview and management of all platform workspaces.</p>
      </div>

      <div className="bg-[#1c1f2e] border border-[#ffffff]/5 rounded-xl flex flex-col shadow-lg flex-1 min-h-[500px]">
        {/* Toolbar */}
        <div className="p-5 border-b border-[#ffffff]/5 flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#1c1f2e] rounded-t-xl shrink-0">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Search workspaces..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-[#0f111a] border border-slate-800 text-sm rounded-lg pl-9 pr-4 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-600"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center h-full min-h-[300px] text-slate-400">Loading workspaces...</div>
          ) : error ? (
            <div className="flex items-center justify-center h-full min-h-[300px] text-red-400 px-6 text-center">{error}</div>
          ) : workspaces.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-slate-500">
              <Layers size={48} className="mb-4 opacity-20" />
              <p>No workspaces found matching your search.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-[#ffffff]/5 text-slate-500 text-[10px] font-bold uppercase tracking-wider bg-[#0f111a] sticky top-0">
                  <th className="p-4 pl-6">Workspace</th>
                  <th className="p-4 w-48">Organization</th>
                  <th className="p-4 w-32">Members</th>
                  <th className="p-4 w-32">Status</th>
                  <th className="p-4 w-40">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ffffff]/5">
                {workspaces.map((workspace) => (
                  <tr key={workspace.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                          <Layers size={14} />
                        </div>
                        <div>
                          <div className="font-bold text-white group-hover:text-emerald-400 transition-colors text-sm">
                            {workspace.name} 
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-1">
                            <User size={10} /> {workspace.createdBy.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-300">
                        <Building2 size={12} className="text-blue-400" />
                        {workspace.organization.name}
                      </div>
                    </td>
                    <td className="p-4 text-slate-300 text-sm">
                      {workspace._count?.members || 0}
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border ${workspace.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                        {workspace.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 text-sm">
                      {new Date(workspace.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminWorkspaces;
