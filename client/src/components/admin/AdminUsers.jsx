import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Users, Search, ChevronDown, ChevronLeft, ChevronRight, 
  MoreVertical, User, ShieldAlert, ArrowLeft, Mail, Calendar, Key, AlertTriangle, Trash2, Building2, Layers
} from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState(null);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
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

  const fetchUsers = async () => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/admin/users?page=${page}&limit=10&search=${search}`,
        { withCredentials: true }
      );
      setUsers(response.data.data.users);
      setTotalPages(response.data.data.pagination.totalPages);
    } catch (err) {
      setUsersError(err.response?.data?.message || "Failed to fetch users");
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchUserDetails = async (userId) => {
    setDetailsLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/admin/users/${userId}`, { withCredentials: true });
      setUserDetails(response.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    fetchUserDetails(user.id);
  };

  const handleChangeRole = async (userId, currentRole) => {
    const newRole = currentRole === "PLATFORM_ADMIN" ? "USER" : "PLATFORM_ADMIN";
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;
    try {
      await axios.patch(`http://localhost:5000/api/admin/users/${userId}/role`, { role: newRole }, { withCredentials: true });
      fetchUsers();
      if (selectedUser?.id === userId) fetchUserDetails(userId);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to change role");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to permanently delete this user? This cannot be undone.")) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, { withCredentials: true });
      if (selectedUser?.id === userId) setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete user");
    }
  };

  useEffect(() => {
    const delay = setTimeout(fetchUsers, 500);
    return () => clearTimeout(delay);
  }, [page, search]);

  // Filter users client-side if a specific role is selected
  // (Since the backend search only searches username/email right now)
  const filteredUsers = roleFilter === "ALL" 
    ? users 
    : users.filter(u => u.platformRole === roleFilter);

  const handleActionClick = (e, userId) => {
    e.stopPropagation();
    setOpenDropdownId(openDropdownId === userId ? null : userId);
  };

  if (selectedUser) {
    return (
      <div className="flex flex-col h-full overflow-y-auto w-full max-w-7xl mx-auto p-4 md:p-6 pb-20">
        <button 
          onClick={() => setSelectedUser(null)}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 w-fit transition-colors"
        >
          <ArrowLeft size={16} /> Back to Users
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#1c1f2e] border border-[#ffffff]/5 rounded-xl p-6 shadow-lg text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-indigo-900/50 to-purple-900/50"></div>
              <div className="h-24 w-24 rounded-full bg-[#0a0c10] border-4 border-[#1c1f2e] mx-auto mt-4 mb-4 relative z-10 flex items-center justify-center text-3xl font-bold text-white overflow-hidden shadow-xl">
                {selectedUser.avatar ? (
                  <img src={selectedUser.avatar} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  (selectedUser.username?.charAt(0) || "U").toUpperCase()
                )}
              </div>
              <h2 className="text-xl font-bold text-white mb-1 relative z-10">{selectedUser.username}</h2>
              <div className="text-slate-400 text-sm mb-4 relative z-10">{selectedUser.email}</div>
              
              <div className="flex justify-center mb-6 relative z-10">
                <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${
                  selectedUser.platformRole === "PLATFORM_ADMIN" 
                    ? "bg-purple-500/10 text-purple-400 border-purple-500/20" 
                    : "bg-slate-800 text-slate-300 border-slate-700"
                }`}>
                  {selectedUser.platformRole}
                </span>
              </div>

              <div className="flex items-center gap-2 justify-center text-emerald-400 text-sm font-medium mb-6 relative z-10">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Active Account
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-[#ffffff]/5 pt-6 relative z-10">
                <div className="text-left">
                  <div className="text-slate-500 text-xs mb-1">Joined Date</div>
                  <div className="text-white text-sm font-medium">{new Date(selectedUser.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-slate-500 text-xs mb-1">ID</div>
                  <div className="text-white text-sm font-medium">USR-{selectedUser.id.toString().padStart(4, '0')}</div>
                </div>
              </div>
            </div>

            {/* Actions Card */}
            <div className="bg-[#1c1f2e] border border-[#ffffff]/5 rounded-xl p-5 shadow-lg">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Key size={16} className="text-slate-400"/> Admin Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => handleChangeRole(selectedUser.id, selectedUser.platformRole)}
                  className="w-full text-left px-4 py-2.5 bg-[#0f111a] hover:bg-slate-800 rounded-lg text-sm text-white font-medium transition-colors flex items-center justify-between border border-[#ffffff]/5">
                  {selectedUser.platformRole === "PLATFORM_ADMIN" ? "Demote to User" : "Promote to Admin"} <ChevronRight size={16} className="text-slate-500" />
                </button>
                <button 
                  onClick={() => handleDeleteUser(selectedUser.id)}
                  className="w-full text-left px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-sm text-red-400 font-medium transition-colors flex items-center justify-between border border-red-500/20">
                  Delete User <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Details Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#1c1f2e] border border-[#ffffff]/5 rounded-xl shadow-lg flex flex-col min-h-[250px]">
              <div className="p-5 border-b border-[#ffffff]/5 flex justify-between items-center shrink-0">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Building2 className="text-blue-400" size={18} /> Organizations
                </h3>
                {userDetails && <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded-full">{userDetails.organizationMemberships?.length || 0} Orgs</span>}
              </div>
              <div className="flex-1 p-5">
                {detailsLoading ? (
                   <div className="text-center text-slate-500 mt-10">Loading organizations...</div>
                ) : userDetails?.organizationMemberships?.length > 0 ? (
                  <div className="space-y-3">
                    {userDetails.organizationMemberships.map(membership => (
                      <div key={membership.organizationId} className="flex items-center justify-between p-3 bg-[#0f111a] rounded-lg border border-[#ffffff]/5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-blue-500/10 text-blue-400 flex items-center justify-center"><Building2 size={14}/></div>
                          <div className="text-white text-sm font-bold">{membership.organization.name}</div>
                        </div>
                        <span className="text-xs text-slate-400 uppercase tracking-wider">{membership.role}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-500 mt-10">
                    <Building2 size={32} className="mb-3 opacity-20" />
                    <p className="text-sm">User does not belong to any organizations.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#1c1f2e] border border-[#ffffff]/5 rounded-xl shadow-lg flex flex-col min-h-[250px]">
              <div className="p-5 border-b border-[#ffffff]/5 flex justify-between items-center shrink-0">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Layers className="text-emerald-400" size={18} /> Workspaces
                </h3>
                {userDetails && <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded-full">{userDetails.workspaceMemberships?.length || 0} Workspaces</span>}
              </div>
              <div className="flex-1 p-5">
                {detailsLoading ? (
                   <div className="text-center text-slate-500 mt-10">Loading workspaces...</div>
                ) : userDetails?.workspaceMemberships?.length > 0 ? (
                  <div className="space-y-3">
                    {userDetails.workspaceMemberships.map(membership => (
                      <div key={membership.workspaceId} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-[#0f111a] rounded-lg border border-[#ffffff]/5 gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-emerald-500/10 text-emerald-400 flex items-center justify-center"><Layers size={14}/></div>
                          <div>
                            <div className="text-white text-sm font-bold">{membership.workspace.name}</div>
                            <div className="text-xs text-slate-500">in {membership.workspace.organization.name}</div>
                          </div>
                        </div>
                        <span className="text-xs text-slate-400 uppercase tracking-wider bg-[#1c1f2e] px-2 py-1 rounded border border-[#ffffff]/5 w-fit">{membership.role}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-500 mt-10">
                    <Layers size={32} className="mb-3 opacity-20" />
                    <p className="text-sm">User does not belong to any workspaces.</p>
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
          <Users className="text-purple-500" size={28} /> Users
        </h1>
        <p className="text-slate-400 text-sm">Manage platform accounts, roles, and access.</p>
      </div>

      <div className="bg-[#1c1f2e] border border-[#ffffff]/5 rounded-xl flex flex-col shadow-lg flex-1 min-h-[500px]">
        {/* Toolbar */}
        <div className="p-5 border-b border-[#ffffff]/5 flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#1c1f2e] rounded-t-xl shrink-0">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Search username or email..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-[#0f111a] border border-slate-800 text-sm rounded-lg pl-9 pr-4 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors placeholder:text-slate-600"
            />
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-48">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full bg-[#0f111a] border border-slate-800 text-sm rounded-lg pl-4 pr-8 py-2 text-white appearance-none focus:outline-none focus:border-purple-500 transition-colors cursor-pointer"
              >
                <option value="ALL">All Roles</option>
                <option value="USER">User</option>
                <option value="PLATFORM_ADMIN">Platform Admin</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto flex-1">
          {usersLoading ? (
            <div className="flex items-center justify-center h-full min-h-[300px] text-slate-400">Loading users...</div>
          ) : usersError ? (
            <div className="flex items-center justify-center h-full min-h-[300px] text-red-400 px-6 text-center">{usersError}</div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-slate-500">
              <Users size={48} className="mb-4 opacity-20" />
              <p>No users found matching your search.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-[#ffffff]/5 text-slate-500 text-[10px] font-bold uppercase tracking-wider bg-[#0f111a] sticky top-0 z-10">
                  <th className="p-4 pl-6">User</th>
                  <th className="p-4 w-40">Platform Role</th>
                  <th className="p-4 w-32">Status</th>
                  <th className="p-4 w-40">Joined</th>
                  <th className="p-4 pr-6 w-24 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ffffff]/5">
                {filteredUsers.map((user) => (
                  <tr key={user.id} onClick={() => handleSelectUser(user)} className="hover:bg-slate-800/30 transition-colors cursor-pointer group">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#0a0c10] border border-slate-700 flex items-center justify-center overflow-hidden shrink-0 text-white font-bold">
                          {user.avatar ? (
                            <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                          ) : (
                            (user.username?.charAt(0) || "U").toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-white group-hover:text-purple-400 transition-colors text-sm">
                            {user.username} 
                          </div>
                          <div className="text-xs text-slate-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 inline-flex text-[10px] font-bold uppercase tracking-wider rounded-md border ${
                        user.platformRole === "PLATFORM_ADMIN" 
                          ? "bg-purple-500/10 text-purple-400 border-purple-500/20" 
                          : "bg-slate-800 text-slate-300 border-slate-700"
                      }`}>
                        {user.platformRole}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Active
                      </div>
                    </td>
                    <td className="p-4 text-slate-400 text-sm">
                      {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="p-4 pr-6 text-right relative">
                      <div className="flex justify-end relative" ref={openDropdownId === user.id ? dropdownRef : null}>
                        <button 
                          onClick={(e) => handleActionClick(e, user.id)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
                        >
                          <MoreVertical size={16} />
                        </button>
                        
                        {openDropdownId === user.id && (
                          <div className="absolute right-0 top-10 w-48 bg-[#0f111a] border border-slate-800 rounded-lg shadow-xl py-1 z-20">
                            <button 
                              className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                              onClick={(e) => { e.stopPropagation(); handleSelectUser(user); }}
                            >
                              <User size={14} /> View Details
                            </button>
                            <button 
                              className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                              onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); handleChangeRole(user.id, user.platformRole); }}
                            >
                              <ShieldAlert size={14} /> Change Role
                            </button>
                            <div className="h-px bg-slate-800 my-1"></div>
                            <button 
                              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                              onClick={(e) => { e.stopPropagation(); setOpenDropdownId(null); handleDeleteUser(user.id); }}
                            >
                              <Trash2 size={14} /> Delete User
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
        {!usersLoading && !usersError && filteredUsers.length > 0 && (
          <div className="p-4 border-t border-[#ffffff]/5 bg-[#1c1f2e] flex justify-between items-center text-xs text-slate-400 shrink-0 rounded-b-xl">
            <div>
              Showing {filteredUsers.length} users on page {page}
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="w-8 text-center text-slate-300 bg-purple-500/20 rounded py-0.5 font-medium">{page}</span>
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

export default AdminUsers;
