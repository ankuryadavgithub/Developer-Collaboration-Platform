import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Building2, Search, ChevronDown, ChevronLeft, ChevronRight, 
  MoreVertical, Eye, AlertTriangle, Trash2, ArrowLeft,
  Users, Layers, Calendar
} from 'lucide-react';

const AdminOrganizations = () => {
  const [orgs, setOrgs] = useState([]);
  const [orgsLoading, setOrgsLoading] = useState(false);
  const [orgsError, setOrgsError] = useState(null);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [orgDetails, setOrgDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchOrgs = async () => {
    setOrgsLoading(true);
    setOrgsError(null);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/admin/organizations?page=${page}&limit=10&search=${search}`,
        { withCredentials: true }
      );
      setOrgs(response.data.data.organizations);
      setTotalPages(response.data.data.pagination.totalPages);
    } catch (err) {
      setOrgsError(err.response?.data?.message || "Failed to fetch organizations");
    } finally {
      setOrgsLoading(false);
    }
  };

  const fetchOrgDetails = async (orgId) => {
    setDetailsLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/admin/organizations/${orgId}`, { withCredentials: true });
      setOrgDetails(response.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleSelectOrg = (org) => {
    setSelectedOrg(org);
    fetchOrgDetails(org.id);
  };

  const handleDeleteOrg = async (orgId) => {
    if (!window.confirm("Are you sure you want to permanently delete this organization? All its workspaces and data will be destroyed.")) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/organizations/${orgId}`, { withCredentials: true });
      if (selectedOrg?.id === orgId) setSelectedOrg(null);
      fetchOrgs();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete organization");
    }
  };

  useEffect(() => {
    const delay = setTimeout(fetchOrgs, 500);
    return () => clearTimeout(delay);
  }, [page, search]);

  // Client-side filter for now as backend doesn't support status filter out of the box yet
  const filteredOrgs = statusFilter === "ALL"
    ? orgs
    : orgs.filter(o => o.status === statusFilter);

  const handleActionClick = (e, orgId) => {
    e.stopPropagation();
    setOpenDropdownId(openDropdownId === orgId ? null : orgId);
  };

  if (selectedOrg) {
    return (
      <div className="flex flex-col h-full overflow-y-auto w-full max-w-7xl mx-auto p-4 md:p-6 pb-20">
        <button 
          onClick={() => setSelectedOrg(null)}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 w-fit transition-colors"
        >
          <ArrowLeft size={16} /> Back to Organizations
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Org Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#1c1f2e] border border-[#ffffff]/5 rounded-xl p-6 shadow-lg relative overflow-hidden text-center">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-blue-900/50 to-indigo-900/50"></div>
              
              <div className="h-20 w-20 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 mx-auto mt-6 mb-4 relative z-10 flex items-center justify-center shadow-xl">
                <Building2 size={36} />
              </div>
              
              <h2 className="text-xl font-bold text-white mb-2 relative z-10">{selectedOrg.name}</h2>
              <div className="text-slate-400 text-sm mb-4 relative z-10 px-4 line-clamp-3">
                {selectedOrg.description || "No description provided."}
              </div>

              <div className="flex items-center gap-2 justify-center text-emerald-400 text-sm font-medium mb-6 relative z-10">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Active Status
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-[#ffffff]/5 pt-6 relative z-10 text-center">
                <div>
                  <div className="text-slate-500 text-xs mb-1">Total Members</div>
                  <div className="text-white text-lg font-bold flex items-center justify-center gap-1">
                    <Users size={14} className="text-slate-400"/> {selectedOrg._count?.members || 0}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 text-xs mb-1">Created Date</div>
                  <div className="text-white text-sm font-medium pt-1">
                    {new Date(selectedOrg.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Card */}
            <div className="bg-[#1c1f2e] border border-[#ffffff]/5 rounded-xl p-5 shadow-lg">
              <h3 className="text-white font-bold mb-4">Organization Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => handleDeleteOrg(selectedOrg.id)}
                  className="w-full text-left px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-sm text-red-400 font-medium transition-colors flex items-center justify-between border border-red-500/20">
                  Delete Organization <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Details Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#1c1f2e] border border-[#ffffff]/5 rounded-xl shadow-lg flex flex-col min-h-[250px]">
              <div className="p-5 border-b border-[#ffffff]/5 flex justify-between items-center shrink-0">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Layers className="text-emerald-400" size={18} /> Workspaces
                </h3>
                {orgDetails && <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded-full">{orgDetails._count?.workspaces || 0} Workspaces</span>}
              </div>
              <div className="flex-1 p-5">
                {detailsLoading ? (
                   <div className="text-center text-slate-500 mt-10">Loading workspaces...</div>
                ) : orgDetails?.workspaces?.length > 0 ? (
                  <div className="space-y-3">
                    {orgDetails.workspaces.map(workspace => (
                      <div key={workspace.id} className="flex items-center justify-between p-3 bg-[#0f111a] rounded-lg border border-[#ffffff]/5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-emerald-500/10 text-emerald-400 flex items-center justify-center"><Layers size={14}/></div>
                          <div className="text-white text-sm font-bold">{workspace.name}</div>
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border ${workspace.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                          {workspace.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-500 mt-10">
                    <Layers size={32} className="mb-3 opacity-20" />
                    <p className="text-sm">This organization has no workspaces.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#1c1f2e] border border-[#ffffff]/5 rounded-xl shadow-lg flex flex-col min-h-[250px]">
              <div className="p-5 border-b border-[#ffffff]/5 flex justify-between items-center shrink-0">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="text-purple-400" size={18} /> Members
                </h3>
                {orgDetails && <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded-full">{orgDetails._count?.members || 0} Members</span>}
              </div>
              <div className="flex-1 p-5">
                {detailsLoading ? (
                   <div className="text-center text-slate-500 mt-10">Loading members...</div>
                ) : orgDetails?.members?.length > 0 ? (
                  <div className="space-y-3">
                    {orgDetails.members.map(member => (
                      <div key={member.id} className="flex items-center justify-between p-3 bg-[#0f111a] rounded-lg border border-[#ffffff]/5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden text-xs text-white font-bold">
                            {member.user.avatar ? <img src={member.user.avatar} alt="avatar" className="w-full h-full object-cover" /> : (member.user.username?.charAt(0) || "U").toUpperCase()}
                          </div>
                          <div>
                            <div className="text-white text-sm font-bold flex items-center gap-2">
                              {member.user.username}
                              {member.user.platformRole === "PLATFORM_ADMIN" && (
                                <span className="text-[9px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded uppercase">Admin</span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500">{member.user.email}</div>
                          </div>
                        </div>
                        <span className="text-xs text-slate-400 uppercase tracking-wider bg-[#1c1f2e] px-2 py-1 rounded border border-[#ffffff]/5">
                          {member.role}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-500 mt-10">
                    <Users size={32} className="mb-3 opacity-20" />
                    <p className="text-sm">No members found.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto w-full max-w-7xl mx-auto p-4 md:p-6 pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Building2 className="text-blue-500" size={28} /> Organizations
        </h1>
        <p className="text-slate-400 text-sm">Manage platform tenants, billing statuses, and organization settings.</p>
      </div>

      <div className="bg-[#1c1f2e] border border-[#ffffff]/5 rounded-xl flex flex-col shadow-lg flex-1 min-h-[500px]">
        {/* Toolbar */}
        <div className="p-5 border-b border-[#ffffff]/5 flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#1c1f2e] rounded-t-xl shrink-0">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Search organizations..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-[#0f111a] border border-slate-800 text-sm rounded-lg pl-9 pr-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600"
            />
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-[#0f111a] border border-slate-800 text-sm rounded-lg pl-4 pr-8 py-2 text-white appearance-none focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto flex-1">
          {orgsLoading ? (
            <div className="flex items-center justify-center h-full min-h-[300px] text-slate-400">Loading organizations...</div>
          ) : orgsError ? (
            <div className="flex items-center justify-center h-full min-h-[300px] text-red-400 px-6 text-center">{orgsError}</div>
          ) : filteredOrgs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-slate-500">
              <Building2 size={48} className="mb-4 opacity-20" />
              <p>No organizations found matching your search.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-[#ffffff]/5 text-slate-500 text-[10px] font-bold uppercase tracking-wider bg-[#0f111a] sticky top-0 z-10">
                  <th className="p-4 pl-6">Organization</th>
                  <th className="p-4 w-32">Members</th>
                  <th className="p-4 w-40">Created</th>
                  <th className="p-4 pr-6 w-24 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ffffff]/5">
                {filteredOrgs.map((org) => (
                  <tr key={org.id} onClick={() => handleSelectOrg(org)} className="hover:bg-slate-800/30 transition-colors cursor-pointer group">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-[#ffffff]/10 flex items-center justify-center text-blue-400 font-bold shrink-0">
                          {org.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-white group-hover:text-blue-400 transition-colors text-sm">
                            {org.name} 
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Users size={14} className="text-slate-500" />
                        {org._count?.members || 0}
                      </div>
                    </td>
                    <td className="p-4 text-slate-400 text-sm">
                      {new Date(org.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="p-4 pr-6 text-right relative">
                      <div className="flex justify-end relative" ref={openDropdownId === org.id ? dropdownRef : null}>
                        <button 
                          onClick={(e) => handleActionClick(e, org.id)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
                        >
                          <MoreVertical size={16} />
                        </button>
                        
                        {openDropdownId === org.id && (
                          <div className="absolute right-0 top-10 w-48 bg-[#0f111a] border border-slate-800 rounded-lg shadow-xl py-1 z-20">
                            <button 
                              className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                              onClick={(e) => { e.stopPropagation(); handleSelectOrg(org); }}
                            >
                              <Eye size={14} /> View Details
                            </button>
                            <div className="h-px bg-slate-800 my-1"></div>
                            <button 
                              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                              onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); handleDeleteOrg(org.id); }}
                            >
                              <Trash2 size={14} /> Delete Org
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Pagination */}
        {!orgsLoading && !orgsError && filteredOrgs.length > 0 && (
          <div className="p-4 border-t border-[#ffffff]/5 bg-[#1c1f2e] flex justify-between items-center text-xs text-slate-400 shrink-0 rounded-b-xl">
            <div>
              Showing {filteredOrgs.length} organizations on page {page}
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="w-8 text-center text-slate-300 bg-blue-500/20 rounded py-0.5 font-medium">{page}</span>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || totalPages === 0}
                className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 transition-colors transform rotate-180"
              >
                <ChevronLeft size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrganizations;
