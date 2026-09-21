import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useOrganization } from "../context/OrganizationContext";
import { Search, UserPlus, Trash2 } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

const OrganizationMembers = () => {
  const { orgId } = useParams();
  const { currentOrg } = useOrganization();
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Invitation State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [inviting, setInviting] = useState(false);
  const [selectedRole, setSelectedRole] = useState("MEMBER");
  const [pendingInvitations, setPendingInvitations] = useState([]);


    const fetchPendingInvitations = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/invitations/org/${orgId}`,
          { withCredentials: true },
        );
        if (res.data.success) {
          // We only want to show PENDING invites in the table
          setPendingInvitations(
            res.data.data.filter((inv) => inv.status === "PENDING"),
          );
        }
      } catch (error) {
        console.error("Failed to fetch pending invitations");
      }
    };

  useEffect(() => {
    fetchMembers();
    fetchPendingInvitations();
  }, [orgId]);

   const handleCancelInvitation = async (invitationId) => {
     if (!window.confirm("Are you sure you want to cancel this invitation?"))
       return;
     try {
       await axios.delete(
         `http://localhost:5000/api/invitations/org/${orgId}/${invitationId}`,
         { withCredentials: true },
       );
       fetchPendingInvitations(); // Refresh the table
     } catch (error) {
       alert("Failed to cancel invitation");
     }
   };


  const fetchMembers = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/organizations/${orgId}/members`,
        { withCredentials: true },
      );
      if (res.data.success) {
        setMembers(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch members");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchUsers = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.get(
        `http://localhost:5000/api/invitations/org/${orgId}/search?search=${searchQuery}`,
        { withCredentials: true },
      );
      setSearchResults(res.data.data);
    } catch (error) {
      alert("Failed to search users. Type at least 3 letters.");
    }
  };

  const handleInviteUser = async (userId) => {
    try {
      setInviting(true);
      await axios.post(
        `http://localhost:5000/api/invitations/org/${orgId}`,
        { userId, role: selectedRole },
        { withCredentials: true },
      );
      alert("Invitation sent successfully!");
      setSearchResults(searchResults.filter((u) => u.id !== userId)); // Remove them from search results
      fetchPendingInvitations();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to invite user");
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/organizations/${orgId}/members/${memberId}/role`,
        { newRole },
        { withCredentials: true },
      );
      fetchMembers(); // Refresh the table
    } catch (error) {
      alert(error.response?.data?.message || "Failed to change role");
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm("Are you sure you want to remove this member?")) return;
    try {
      await axios.delete(
        `http://localhost:5000/api/organizations/${orgId}/members/${memberId}`,
        { withCredentials: true },
      );
      fetchMembers(); // Refresh the table
    } catch (error) {
      alert(error.response?.data?.message || "Failed to remove member");
    }
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (loading) return <div className="p-8 text-white flex h-screen items-center justify-center">Loading members...</div>;

  // The UI automatically hides privileged actions if they aren't an OWNER or ADMIN
  const isAdminOrOwner = ["OWNER", "ADMIN"].includes(currentOrg?.myRole);

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-[#111827] to-indigo-950">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main className="flex-1 p-4 md:p-8 w-full h-full overflow-y-auto min-w-0">
        <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="text-white max-w-6xl mx-auto mt-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <button
                  onClick={() => navigate("/organization")}
                  className="text-slate-500 hover:text-white transition-colors"
                >
                  ←
                </button>
                Organization Members
              </h1>
              <p className="text-slate-400 mt-1">
                Manage the people in {currentOrg?.name}
              </p>
            </div>
          </div>

          {isAdminOrOwner && (
            <div className="bg-[#1c1f2e] p-6 rounded-xl border border-[#ffffff]/10 mb-8 shadow-lg">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <UserPlus size={20} /> Invite New Members
              </h2>
              <form onSubmit={handleSearchUsers} className="flex flex-col sm:flex-row gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Search DevHub users by username or email..."
                  className="flex-1 bg-[#0f111a] border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-blue-500 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Search size={18} /> Search
                </button>
              </form>

              {searchResults.length > 0 && (
                <div className="bg-[#0f111a] border border-slate-700 rounded-lg overflow-hidden">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b border-slate-700 last:border-0 hover:bg-[#1c1f2e] gap-4 sm:gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            user.avatar ||
                            `https://ui-avatars.com/api/?name=${user.username}`
                          }
                          alt="Avatar"
                          className="w-10 h-10 rounded-full shrink-0"
                        />
                        <div>
                          <p className="font-bold">{user.username}</p>
                          <p className="text-sm text-slate-400">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <select
                          className="flex-1 sm:flex-none bg-[#0f111a] border border-slate-700 text-sm text-slate-300 rounded p-2 sm:p-1.5 outline-none cursor-pointer"
                          value={selectedRole}
                          onChange={(e) => setSelectedRole(e.target.value)}
                        >
                          <option value="MEMBER">Member</option>
                          <option value="MANAGER">Manager</option>
                          <option value="ADMIN">Admin</option>
                        </select>

                        <button
                          onClick={() => handleInviteUser(user.id)}
                          disabled={inviting}
                          className="bg-slate-800 hover:bg-blue-600 text-white py-2 sm:py-1 px-6 sm:px-4 rounded-full text-sm font-semibold transition-colors cursor-pointer"
                        >
                          Invite
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {isAdminOrOwner && pendingInvitations.length > 0 && (
            <div className="bg-[#1c1f2e] p-6 rounded-xl border border-[#ffffff]/10 mb-8 shadow-lg">
              <h2 className="text-xl font-bold mb-4">Pending Invitations</h2>
              <div className="bg-[#0f111a] border border-slate-700 rounded-lg overflow-hidden">
                {pendingInvitations.map((invite) => (
                  <div key={invite.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b border-slate-700 last:border-0 hover:bg-[#1c1f2e] gap-4 sm:gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={invite.invitedUser.avatar || `https://ui-avatars.com/api/?name=${invite.invitedUser.username}`}
                        alt="Avatar"
                        className="w-10 h-10 rounded-full shrink-0"
                      />
                      <div>
                        <p className="font-bold">{invite.invitedUser.username}</p>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400 mt-0.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-500/20 text-yellow-500">PENDING</span>
                          <span className="hidden sm:inline">•</span>
                          <span>Role: {invite.role}</span>
                          <span className="hidden sm:inline">•</span>
                          <span>Sent: {new Date(invite.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCancelInvitation(invite.id)}
                      className="w-full sm:w-auto text-sm font-semibold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 py-2 sm:py-1.5 rounded transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-[#1c1f2e] rounded-xl border border-[#ffffff]/10 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-[#0f111a] text-slate-400 text-sm border-b border-[#ffffff]/10">
                    <th className="p-4 font-semibold">Member</th>
                    <th className="p-4 font-semibold">Role</th>
                    <th className="p-4 font-semibold">Joined Date</th>
                    {isAdminOrOwner && (
                      <th className="p-4 font-semibold text-right">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr
                      key={member.id}
                      className="border-b border-[#ffffff]/10 last:border-0 hover:bg-[#252a3e] transition-colors"
                    >
                      <td className="p-4 flex items-center gap-3">
                        <img
                          src={
                            member.user.avatar ||
                            `https://ui-avatars.com/api/?name=${member.user.username}`
                          }
                          alt="Avatar"
                          className="w-10 h-10 rounded-full shrink-0"
                        />
                        <div>
                          <p className="font-bold">{member.user.username}</p>
                          <p className="text-sm text-slate-400">
                            {member.user.email}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        {isAdminOrOwner &&
                        member.role !== "OWNER" &&
                        !(
                          currentOrg?.myRole === "ADMIN" &&
                          member.role === "ADMIN"
                        ) ? (
                          <select
                            className="bg-[#0f111a] text-sm text-white font-semibold rounded p-1 border border-slate-700 outline-none cursor-pointer"
                            value={member.role}
                            onChange={(e) =>
                              handleRoleChange(member.id, e.target.value)
                            }
                          >
                            {currentOrg?.myRole === "OWNER" && (
                              <option value="ADMIN">Admin</option>
                            )}
                            <option value="MANAGER">Manager</option>
                            <option value="MEMBER">Member</option>
                          </select>
                        ) : (
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              member.role === "OWNER"
                                ? "bg-orange-500/20 text-orange-400"
                                : member.role === "ADMIN"
                                  ? "bg-purple-500/20 text-purple-400"
                                  : "bg-slate-700 text-slate-300"
                            }`}
                          >
                            {member.role}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-slate-400 text-sm whitespace-nowrap">
                        {new Date(member.joinedAt).toLocaleDateString()}
                      </td>
                      {isAdminOrOwner && (
                        <td className="p-4 text-right">
                          {member.role !== "OWNER" &&
                            !(
                              currentOrg?.myRole === "ADMIN" &&
                              member.role === "ADMIN"
                            ) && (
                              <button
                                onClick={() => handleRemoveMember(member.id)}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                                title="Remove Member"
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrganizationMembers;
