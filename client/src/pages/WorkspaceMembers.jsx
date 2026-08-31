import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Trash2, UserPlus, ShieldAlert, Users, Search, 
  Mail, Calendar, User, MoreVertical, Send, ChevronDown, ChevronLeft
} from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

const WorkspaceMembers = () => {
  const { orgId, workspaceId } = useParams();
  const navigate = useNavigate();
  
  const [members, setMembers] = useState([]);
  const [availableMembers, setAvailableMembers] = useState([]);
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // For adding a member
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState("VIEWER");
  const [isAdding, setIsAdding] = useState(false);
  
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Search, Filter, Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Sidebar Tab State
  const [activeTab, setActiveTab] = useState("members");

  // Dropdown menu state
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const dropdownRef = useRef(null);
  
  const userStr = localStorage.getItem("user");
  const currentUser = userStr ? JSON.parse(userStr) : null;

  // Safely filter out the current user from available members just in case
  const filteredAvailableMembers = availableMembers.filter(
    (m) => m.user.id !== currentUser?.id
  );

  // Roles mapping for UI
  const roleOptions = [
    { value: "WORKSPACE_ADMIN", label: "Admin", color: "orange" },
    { value: "CONTRIBUTOR", label: "Manager", color: "blue" },
    { value: "VIEWER", label: "Member", color: "slate" }
  ];

  useEffect(() => {
    fetchData();
  }, [workspaceId]);

  useEffect(() => {
    // Click outside to close dropdown
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [membersRes, availableRes, workspaceRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/organizations/${orgId}/workspaces/${workspaceId}/members`, { withCredentials: true }),
        axios.get(`http://localhost:5000/api/organizations/${orgId}/workspaces/${workspaceId}/members/available`, { withCredentials: true }),
        axios.get(`http://localhost:5000/api/organizations/${orgId}/workspaces/${workspaceId}`, { withCredentials: true })
      ]);
      
      if (membersRes.data.success) setMembers(membersRes.data.data);
      if (availableRes.data.success) setAvailableMembers(availableRes.data.data);
      if (workspaceRes.data.success) setWorkspace(workspaceRes.data.data);
      
    } catch (error) {
      console.error("Failed to fetch data", error);
      setMessage({ text: "Failed to load workspace data.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return;
    
    setIsAdding(true);
    setMessage({ text: "", type: "" });
    
    try {
      const res = await axios.post(
        `http://localhost:5000/api/organizations/${orgId}/workspaces/${workspaceId}/members`,
        { userId: selectedUserId, role: selectedRole },
        { withCredentials: true }
      );
      
      if (res.data.success) {
        setMessage({ text: "Invitation sent successfully!", type: "success" });
        setSelectedUserId("");
        setSelectedRole("VIEWER");
        fetchData();
      }
    } catch (error) {
      setMessage({ text: error.response?.data?.message || "Failed to add member.", type: "error" });
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      const res = await axios.patch(
        `http://localhost:5000/api/organizations/${orgId}/workspaces/${workspaceId}/members/${userId}`,
        { role: newRole },
        { withCredentials: true }
      );
      
      if (res.data.success) {
        setMessage({ text: "Role updated successfully!", type: "success" });
        setMembers(members.map(m => m.user.id === userId ? { ...m, role: newRole } : m));
        setOpenDropdownId(null);
      }
    } catch (error) {
      setMessage({ text: error.response?.data?.message || "Failed to update role.", type: "error" });
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm("Are you sure you want to remove this member from the workspace?")) return;
    setOpenDropdownId(null);
    try {
      const res = await axios.delete(
        `http://localhost:5000/api/organizations/${orgId}/workspaces/${workspaceId}/members/${userId}`,
        { withCredentials: true }
      );
      
      if (res.data.success) {
        setMessage({ text: "Member removed successfully!", type: "success" });
        fetchData();
      }
    } catch (error) {
      setMessage({ text: error.response?.data?.message || "Failed to remove member.", type: "error" });
    }
  };

  useEffect(() => {
    if (message.type === 'success' && message.text) {
      const timer = setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (loading)
    return <div className="p-8 text-white flex h-screen items-center justify-center bg-[#0f111a]">Loading...</div>;

  const currentWorkspaceMember = members.find(m => m.user.id === currentUser?.id);
  const isWorkspaceAdmin = currentWorkspaceMember?.role === "WORKSPACE_ADMIN"; 
  const creatorId = workspace?.createdById;

  const adminsCount = members.filter(m => m.role === 'WORKSPACE_ADMIN').length;
  const regularCount = members.filter(m => m.role !== 'WORKSPACE_ADMIN').length;

  // Filtering
  const filteredMembers = members.filter(m => {
    const matchesSearch = m.user.username?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          m.user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "ALL" || m.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Pagination
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMembers = filteredMembers.slice(startIndex, startIndex + itemsPerPage);

  const getRoleBadgeClasses = (roleValue) => {
    if (roleValue === 'WORKSPACE_ADMIN') return 'bg-orange-500/10 text-orange-400 border-orange-500/30 hover:border-orange-500/50';
    if (roleValue === 'CONTRIBUTOR') return 'bg-blue-500/10 text-blue-400 border-blue-500/30 hover:border-blue-500/50';
    return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30 hover:border-indigo-500/50';
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f111a] font-sans">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <div className="flex-1 flex overflow-hidden p-4 gap-4">
          
          {/* Inner Left Sidebar */}
          <div className="w-64 bg-[#11131e] rounded-xl flex flex-col overflow-hidden shrink-0 shadow-lg border border-slate-800/50">
            <div className="p-4 pt-6">
              <button
                onClick={() => navigate(`/organizations/${orgId}/workspaces/${workspaceId}/dashboard`)}
                className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-2 group mb-6"
              >
                <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Workspace
              </button>
            </div>
            
            <div className="px-3 space-y-1">
              <button 
                onClick={() => setActiveTab("members")}
                className={`w-full text-left px-4 py-2.5 rounded-lg font-medium flex items-center gap-3 transition-colors border ${activeTab === "members" ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/10" : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border-transparent"}`}
              >
                <Users size={18} /> Members
              </button>
            </div>
            
            <div className="mt-auto p-4">
              <div className="bg-[#1c1f2e] border border-slate-800 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldAlert size={16} className="text-blue-400" />
                  <h3 className="text-sm font-semibold text-slate-200">Workspace Roles</h3>
                </div>
                <div className="space-y-4 text-xs">
                  <div>
                    <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wider mr-2">Creator</span>
                    <span className="text-slate-400 leading-tight block mt-1">Full control of workspace</span>
                  </div>
                  <div>
                    <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wider mr-2">Admin</span>
                    <span className="text-slate-400 leading-tight block mt-1">Manage members and workspace settings</span>
                  </div>
                  <div>
                    <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wider mr-2">Member</span>
                    <span className="text-slate-400 leading-tight block mt-1">Access workspace resources</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 bg-[#11131e] border border-slate-800/50 rounded-xl flex flex-col overflow-y-auto shadow-lg relative p-6 md:p-8">
            
            {message.text && (
              <div className={`absolute top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2 text-sm font-medium ${message.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                {message.text}
              </div>
            )}

            {/* Header Section */}
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3 mb-2">
                      <Users className="text-indigo-500" size={28} /> Workspace Members
                    </h1>
                    <p className="text-slate-400 text-sm">Manage who has access to this workspace and their permission levels.</p>
                  </div>
                  {isWorkspaceAdmin && (
                    <button 
                      onClick={() => document.getElementById('invite-section')?.scrollIntoView({ behavior: 'smooth' })}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-lg shadow-indigo-500/20"
                    >
                      <UserPlus size={16} /> Invite Members
                    </button>
                  )}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-[#1c1f2e] border border-slate-800 rounded-xl p-5 flex items-center gap-4">
                    <div className="bg-indigo-500/10 p-3 rounded-lg text-indigo-400 shrink-0"><Users size={20} /></div>
                    <div>
                      <div className="text-xl font-bold text-white leading-none mb-1">{members.length}</div>
                      <div className="text-slate-400 text-[11px] leading-tight">Total Members<br/>People in this workspace</div>
                    </div>
                  </div>
                  <div className="bg-[#1c1f2e] border border-slate-800 rounded-xl p-5 flex items-center gap-4">
                    <div className="bg-orange-500/10 p-3 rounded-lg text-orange-400 shrink-0"><ShieldAlert size={20} /></div>
                    <div>
                      <div className="text-xl font-bold text-white leading-none mb-1">{adminsCount}</div>
                      <div className="text-slate-400 text-[11px] leading-tight">Admins<br/>Workspace administrators</div>
                    </div>
                  </div>
                  <div className="bg-[#1c1f2e] border border-slate-800 rounded-xl p-5 flex items-center gap-4">
                    <div className="bg-blue-500/10 p-3 rounded-lg text-blue-400 shrink-0"><User size={20} /></div>
                    <div>
                      <div className="text-xl font-bold text-white leading-none mb-1">{regularCount}</div>
                      <div className="text-slate-400 text-[11px] leading-tight">Members<br/>Regular workspace members</div>
                    </div>
                  </div>
                  <div className="bg-[#1c1f2e] border border-slate-800 rounded-xl p-5 flex items-center gap-4">
                    <div className="bg-green-500/10 p-3 rounded-lg text-green-400 shrink-0"><Calendar size={20} /></div>
                    <div>
                      <div className="text-lg font-bold text-white leading-none mb-1">
                        {workspace ? new Date(workspace.createdAt).toLocaleDateString(undefined, {year: 'numeric', month: 'short', day: 'numeric'}) : '...'}
                      </div>
                      <div className="text-slate-400 text-[11px] leading-tight">Created On<br/>Workspace creation date</div>
                    </div>
                  </div>
                </div>

                {/* Invite Section */}
                {isWorkspaceAdmin && (
                  <div id="invite-section" className="bg-[#1c1f2e] border border-slate-800 rounded-xl p-6 mb-8">
                    <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                      <UserPlus size={18} className="text-indigo-400"/> Invite Members
                    </h2>
                    <p className="text-slate-400 text-sm mb-6">Invite organization members to join this workspace.</p>
                    
                    {availableMembers.length === 0 ? (
                      <div className="bg-[#0f111a] border border-slate-800 rounded-lg p-4 text-slate-400 text-sm flex items-center gap-2">
                        <ShieldAlert size={16} className="text-slate-500" />
                        All organization members are already in this workspace.
                      </div>
                    ) : (
                      <form onSubmit={handleAddMember} className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full relative">
                          <label className="block text-xs font-semibold text-slate-400 mb-2">Select Member</label>
                          <div className="relative">
                            <select
                              value={selectedUserId}
                              onChange={(e) => setSelectedUserId(e.target.value)}
                              className="w-full bg-[#0f111a] border border-slate-800 hover:border-slate-700 rounded-lg p-2.5 pl-4 appearance-none text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                              required
                            >
                              <option value="" disabled className="bg-[#1c1f2e] text-slate-400">Select organization member...</option>
                              {availableMembers.map(orgMember => (
                                <option key={orgMember.user.id} value={orgMember.user.id} className="bg-[#1c1f2e] text-white py-2">
                                  {orgMember.user.username} ({orgMember.user.email})
                                </option>
                              ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                          </div>
                        </div>
                        
                        <div className="w-full md:w-64 relative">
                          <label className="block text-xs font-semibold text-slate-400 mb-2">Workspace Role</label>
                          <div className="relative">
                            <select
                              value={selectedRole}
                              onChange={(e) => setSelectedRole(e.target.value)}
                              className="w-full bg-[#0f111a] border border-slate-800 hover:border-slate-700 rounded-lg p-2.5 pl-4 appearance-none text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                            >
                              {roleOptions.map(role => (
                                <option key={role.value} value={role.value} className="bg-[#1c1f2e] text-white">
                                  {role.label}
                                </option>
                              ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                          </div>
                        </div>
                        
                        <button
                          type="submit"
                          disabled={isAdding || !selectedUserId}
                          className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2.5 px-6 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {isAdding ? "Sending..." : <><Send size={14} /> Send Invitation</>}
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {/* Current Members Section */}
                <div className="bg-[#1c1f2e] border border-slate-800 rounded-xl flex flex-col flex-1 overflow-hidden min-h-[300px]">
                  <div className="p-5 border-b border-slate-800 flex justify-between items-center shrink-0">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                      Current Members 
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs">{members.length}</span>
                    </h2>
                  </div>
                  
                  <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-[#1c1f2e] shrink-0">
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      <input 
                        type="text" 
                        placeholder="Search members..." 
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        className="w-full bg-[#0f111a] border border-slate-800 text-sm rounded-lg pl-9 pr-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                    <div className="relative w-40">
                      <select
                        value={roleFilter}
                        onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
                        className="w-full bg-[#0f111a] border border-slate-800 text-sm rounded-lg pl-4 pr-8 py-2 text-white appearance-none focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                      >
                        <option value="ALL">All Roles</option>
                        {roleOptions.map(role => (
                          <option key={role.value} value={role.value}>{role.label}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto flex-1 h-full">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-500 text-[10px] font-bold uppercase tracking-wider bg-[#1c1f2e] sticky top-0 z-10">
                          <th className="p-4 pl-6">Member</th>
                          <th className="p-4 w-40">Role</th>
                          <th className="p-4 w-40">Joined Date</th>
                          <th className="p-4 pr-6 w-32 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {paginatedMembers.map((member) => {
                          const isCreator = member.user.id === creatorId;
                          const isCurrentUser = member.user.id === currentUser?.id;
                          
                          return (
                            <tr key={member.id} className="hover:bg-slate-800/30 transition-colors">
                              <td className="p-4 pl-6">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                                    {member.user.avatar ? (
                                      <img src={member.user.avatar} alt="avatar" className="w-full h-full object-cover" />
                                    ) : (
                                      <span className="font-bold text-sm text-slate-300">{member.user.username?.charAt(0).toUpperCase()}</span>
                                    )}
                                  </div>
                                  <div>
                                    <div className="font-medium text-slate-200 flex items-center gap-2 text-sm">
                                      {member.user.username} 
                                      {isCurrentUser && (
                                        <span className="bg-indigo-500/20 text-indigo-400 text-[10px] px-1.5 py-0.5 rounded border border-indigo-500/20">You</span>
                                      )}
                                    </div>
                                    <div className="text-xs text-slate-500">{member.user.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                {isWorkspaceAdmin && !isCreator ? (
                                  <div className="relative inline-block w-full max-w-[120px]">
                                    <select
                                      value={member.role}
                                      onChange={(e) => handleUpdateRole(member.user.id, e.target.value)}
                                      className={`appearance-none w-full border rounded-md py-1.5 pl-3 pr-8 text-xs font-semibold cursor-pointer focus:outline-none transition-colors ${getRoleBadgeClasses(member.role)}`}
                                    >
                                      {roleOptions.map(role => (
                                        <option key={role.value} value={role.value} className="bg-[#1c1f2e] text-white">
                                          {role.label}
                                        </option>
                                      ))}
                                    </select>
                                    <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-current opacity-70 pointer-events-none" />
                                  </div>
                                ) : (
                                  <span className={`inline-block px-3 py-1 rounded-md text-xs font-semibold border ${getRoleBadgeClasses(member.role)}`}>
                                    {roleOptions.find(r => r.value === member.role)?.label || member.role}
                                  </span>
                                )}
                              </td>
                              <td className="p-4 text-slate-400 text-sm">
                                {new Date(member.joinedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                              </td>
                              <td className="p-4 pr-6 text-right relative">
                                {isCreator ? (
                                  <span className="inline-flex items-center gap-1.5 bg-slate-800 border border-slate-700 text-slate-300 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md">
                                    <ShieldAlert size={12}/> Creator
                                  </span>
                                ) : isWorkspaceAdmin && !isCurrentUser ? (
                                  <div className="flex justify-end relative" ref={openDropdownId === member.id ? dropdownRef : null}>
                                    <button 
                                      onClick={() => setOpenDropdownId(openDropdownId === member.id ? null : member.id)}
                                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
                                    >
                                      <MoreVertical size={16} />
                                    </button>
                                    
                                    {openDropdownId === member.id && (
                                      <div className="absolute right-0 top-10 w-48 bg-[#1c1f2e] border border-slate-800 rounded-lg shadow-xl py-1 z-10">
                                        <button 
                                          className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                                          onClick={() => {
                                            setOpenDropdownId(null);
                                            alert("You can change the role directly using the dropdown in the Role column.");
                                          }}
                                        >
                                          <User size={14} /> Change Role
                                        </button>
                                        <button 
                                          className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                                          onClick={() => handleRemoveMember(member.user.id)}
                                        >
                                          <Trash2 size={14} /> Remove from Workspace
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ) : null}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {paginatedMembers.length === 0 && (
                      <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                        <Users size={32} className="mb-3 opacity-20" />
                        <p>No members found matching your search.</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Pagination Footer */}
                  <div className="p-4 border-t border-slate-800 bg-[#1c1f2e] flex justify-between items-center text-xs text-slate-400 shrink-0">
                    <div>
                      Showing {Math.min(startIndex + 1, filteredMembers.length)} to {Math.min(startIndex + itemsPerPage, filteredMembers.length)} of {filteredMembers.length} members
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 transition-colors"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <span className="w-6 text-center text-slate-300 bg-indigo-500/20 rounded py-0.5 font-medium">{currentPage}</span>
                      <button 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 transition-colors transform rotate-180"
                      >
                        <ChevronLeft size={16} />
                      </button>
                    </div>
                  </div>
                </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WorkspaceMembers;
