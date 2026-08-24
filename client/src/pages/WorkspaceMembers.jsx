import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Trash2, UserPlus, ShieldAlert, Users, Search } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

const WorkspaceMembers = () => {
  const { orgId, workspaceId } = useParams();
  const navigate = useNavigate();
  
  const [members, setMembers] = useState([]);
  const [availableMembers, setAvailableMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // For adding a member
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState("VIEWER");
  const [isAdding, setIsAdding] = useState(false);
  
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const userStr = localStorage.getItem("user");
  const currentUser = userStr ? JSON.parse(userStr) : null;

  // Roles mapping for UI
  const roleOptions = [
    { value: "WORKSPACE_ADMIN", label: "Admin" },
    { value: "CONTRIBUTOR", label: "Manager" },
    { value: "VIEWER", label: "Member" }
  ];

  useEffect(() => {
    fetchData();
  }, [workspaceId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [membersRes, availableRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/organizations/${orgId}/workspaces/${workspaceId}/members`, { withCredentials: true }),
        axios.get(`http://localhost:5000/api/organizations/${orgId}/workspaces/${workspaceId}/members/available`, { withCredentials: true })
      ]);
      
      if (membersRes.data.success) {
        setMembers(membersRes.data.data);
      }
      
      if (availableRes.data.success) {
        setAvailableMembers(availableRes.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch members data", error);
      setMessage({ text: "Failed to load members.", type: "error" });
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
        setMessage({ text: "Member added successfully!", type: "success" });
        setSelectedUserId("");
        setSelectedRole("VIEWER");
        fetchData(); // refresh lists
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
      }
    } catch (error) {
      setMessage({ text: error.response?.data?.message || "Failed to update role.", type: "error" });
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm("Are you sure you want to remove this member from the workspace?")) return;
    
    try {
      const res = await axios.delete(
        `http://localhost:5000/api/organizations/${orgId}/workspaces/${workspaceId}/members/${userId}`,
        { withCredentials: true }
      );
      
      if (res.data.success) {
        setMessage({ text: "Member removed successfully!", type: "success" });
        fetchData(); // refresh lists to put them back in available
      }
    } catch (error) {
      setMessage({ text: error.response?.data?.message || "Failed to remove member.", type: "error" });
    }
  };

  // Auto-hide success messages
  useEffect(() => {
    if (message.type === 'success' && message.text) {
      const timer = setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (loading)
    return <div className="p-8 text-white flex h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-[#111827] to-indigo-950">Loading Members...</div>;

  // Determine if the current user is a Workspace Admin
  const currentWorkspaceMember = members.find(m => m.user.id === currentUser?.id);
  const isWorkspaceAdmin = currentWorkspaceMember?.role === "WORKSPACE_ADMIN" || false; 

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f111a]">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main className="flex-1 p-4 md:p-8 w-full h-full overflow-y-auto min-w-0 bg-gradient-to-br from-slate-950 via-[#111827] to-indigo-950">
        <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="text-white max-w-5xl mx-auto mt-6 pb-12">
          
          <button
            onClick={() => navigate(`/organizations/${orgId}/workspaces/${workspaceId}/dashboard`)}
            className="text-slate-400 hover:text-white transition-colors text-sm mb-6 flex items-center gap-2 group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Workspace
          </button>

          <div className="mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
              <Users className="text-blue-500" size={32} />
              Workspace Members
            </h1>
            <p className="text-slate-400">
              Manage who has access to this project and their permission levels.
            </p>
          </div>

          {message.text && (
            <div className={`p-4 rounded-lg mb-6 transition-all duration-300 flex items-center gap-3 ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
              <div className={`w-2 h-2 rounded-full ${message.type === 'success' ? 'bg-green-400' : 'bg-red-400'}`}></div>
              {message.text}
            </div>
          )}

          {isWorkspaceAdmin && (
            <div className="bg-[#1c1f2e] p-6 rounded-xl border border-slate-800 shadow-xl mb-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
              <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
                <UserPlus size={18} className="text-blue-400"/> Add New Member
              </h2>
              
              {availableMembers.length === 0 ? (
                <div className="bg-[#0f111a] border border-slate-800 rounded-lg p-4 text-slate-400 text-sm flex items-center gap-2">
                  <ShieldAlert size={16} className="text-slate-500" />
                  All organization members are already in this workspace.
                </div>
              ) : (
                <form onSubmit={handleAddMember} className="flex flex-col md:flex-row gap-4 items-end">
                  <div className="flex-1 w-full relative">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Organization Member</label>
                    <div className="relative">
                      <select
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        className="w-full bg-[#0f111a] border border-slate-700 hover:border-slate-600 rounded-lg p-3 pl-4 appearance-none text-white focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                        required
                      >
                        <option value="" disabled className="bg-[#1c1f2e] text-slate-400">Select a member...</option>
                        {availableMembers.map(orgMember => (
                          <option key={orgMember.user.id} value={orgMember.user.id} className="bg-[#1c1f2e] text-white py-2">
                            {orgMember.user.username} ({orgMember.user.email})
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full md:w-56 relative">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Workspace Role</label>
                    <div className="relative">
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="w-full bg-[#0f111a] border border-slate-700 hover:border-slate-600 rounded-lg p-3 appearance-none text-white focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                      >
                        {roleOptions.map(role => (
                          <option key={role.value} value={role.value} className="bg-[#1c1f2e] text-white">
                            {role.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isAdding || !selectedUserId}
                    className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 px-8 rounded-lg transition-all disabled:opacity-50 disabled:hover:bg-blue-600 shadow-lg shadow-blue-500/20"
                  >
                    {isAdding ? "Adding..." : "Add Member"}
                  </button>
                </form>
              )}
            </div>
          )}

          <div className="bg-[#1c1f2e] rounded-xl border border-slate-800 shadow-xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h2 className="text-lg font-semibold">Current Members <span className="ml-2 px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs">{members.length}</span></h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0f111a]/80 border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="p-4 font-semibold pl-6">Member</th>
                    <th className="p-4 font-semibold w-48">Role</th>
                    <th className="p-4 font-semibold w-40">Joined Date</th>
                    {isWorkspaceAdmin && <th className="p-4 font-semibold text-right pr-6 w-24">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {members.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-800/30 transition-colors group">
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
                            <div className="font-medium flex items-center gap-2">
                              {member.user.username} 
                              {member.user.id === currentUser?.id && (
                                <span className="bg-blue-500/10 text-blue-400 text-[10px] px-2 py-0.5 rounded-full border border-blue-500/20">You</span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500">{member.user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        {isWorkspaceAdmin && member.user.id !== currentUser?.id ? (
                          <div className="relative inline-block w-full max-w-[140px]">
                            <select
                              value={member.role}
                              onChange={(e) => handleUpdateRole(member.user.id, e.target.value)}
                              className={`appearance-none w-full border rounded-md py-1.5 pl-3 pr-8 text-xs font-semibold cursor-pointer focus:outline-none transition-colors ${
                                member.role === 'WORKSPACE_ADMIN' ? 'bg-orange-500/10 text-orange-400 border-orange-500/30 hover:border-orange-500/50' : 
                                member.role === 'CONTRIBUTOR' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 hover:border-blue-500/50' : 
                                'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500'
                              }`}
                            >
                              {roleOptions.map(role => (
                                <option key={role.value} value={role.value} className="bg-[#1c1f2e] text-white">
                                  {role.label}
                                </option>
                              ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none opacity-50">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                          </div>
                        ) : (
                          <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${
                            member.role === 'WORKSPACE_ADMIN' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 
                            member.role === 'CONTRIBUTOR' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                            'bg-slate-800 text-slate-300 border-slate-700'
                          }`}>
                            {roleOptions.find(r => r.value === member.role)?.label || member.role}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-slate-400 text-sm">
                        {new Date(member.joinedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      {isWorkspaceAdmin && (
                        <td className="p-4 pr-6 text-right">
                          {member.user.id !== currentUser?.id ? (
                            <button
                              onClick={() => handleRemoveMember(member.user.id)}
                              className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all p-2 rounded-lg opacity-0 group-hover:opacity-100 focus:opacity-100"
                              title="Remove from Workspace"
                            >
                              <Trash2 size={16} />
                            </button>
                          ) : (
                            <span className="text-slate-500 text-xs flex items-center justify-end gap-1"><ShieldAlert size={12}/> Creator</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {members.length === 0 && (
              <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                <Users size={32} className="mb-3 opacity-20" />
                <p>No members found in this workspace.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default WorkspaceMembers;
