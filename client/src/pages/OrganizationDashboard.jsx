import React, { useState, useEffect } from "react";
import { useOrganization } from "../context/OrganizationContext";
import axios from "axios";
import { Users, Settings, Building, Plus, FolderGit2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

const OrganizationDashboard = () => {
  const { organizations, currentOrg, fetchOrganizations, loading, switchOrganization } = useOrganization();
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgDesc, setNewOrgDesc] = useState("");
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrganizations();
  }, []);



  const handleCreateOrg = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      await axios.post(
        "http://localhost:5000/api/organizations",
        {
          name: newOrgName,
          description: newOrgDesc,
        },
        { withCredentials: true },
      );
      await fetchOrganizations(); // Refresh the Context so the Sidebar dropdown updates immediately!
      setNewOrgName("");
      setNewOrgDesc("");
    } catch (err) {
      alert("Failed to create organization");
    } finally {
      setCreating(false);
    }
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (loading)
    return <div className="min-h-screen bg-[#0f111a] p-8 text-white flex items-center justify-center">Loading Organization...</div>;

  // View 1: User has no organization yet. Show them the creation form.
  if (!currentOrg) {
    return (
      <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-[#111827] to-indigo-950">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <main className="flex-1 p-4 w-full h-full overflow-y-auto min-w-0">
          <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
          <div className="text-white max-w-xl mx-auto mt-16">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-3xl font-bold">Welcome to DevHub!</h2>
            </div>
            <p className="text-slate-400 mb-8">
              You aren't part of any organizations yet. Create one to get started.
            </p>

            <form
              onSubmit={handleCreateOrg}
              className="bg-[#1c1f2e] p-6 rounded-xl border border-[#ffffff]/10 shadow-lg"
            >
              <div className="mb-4">
                <label className="block text-sm text-slate-400 mb-2">
                  Organization Name
                </label>
                <input
                  required
                  type="text"
                  className="w-full bg-[#0f111a] border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-blue-500"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  placeholder="e.g. ABC Technologies"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm text-slate-400 mb-2">
                  Description
                </label>
                <textarea
                  className="w-full bg-[#0f111a] border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-blue-500 h-24"
                  value={newOrgDesc}
                  onChange={(e) => setNewOrgDesc(e.target.value)}
                  placeholder="What does your organization do?"
                />
              </div>
              <button
                type="submit"
                disabled={creating}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Plus size={20} />
                {creating ? "Creating..." : "Create Organization"}
              </button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  // View 2: User has an organization selected!
  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-[#111827] to-indigo-950">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main className="flex-1 p-4 md:p-8 w-full h-full overflow-y-auto min-w-0">
        <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="text-white max-w-5xl mx-auto mt-10">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-[#ffffff]/10 relative">
            <div className="flex w-full items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-blue-600/20 text-blue-500 rounded-2xl flex items-center justify-center">
                  <Building size={32} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{currentOrg.name}</h1>
                  <p className="text-slate-400 mt-1">
                    {currentOrg.description || "No description provided."}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-3 mt-1">
                <span className="px-4 py-2 bg-slate-800 text-slate-300 rounded-full text-sm font-semibold border border-slate-700 uppercase">
                  Role: {currentOrg.myRole}
                </span>
                
                {organizations.length > 1 && (
                  <select
                    className="bg-[#1c1f2e] text-white text-sm font-semibold rounded-lg p-2 outline-none border border-slate-700 hover:border-slate-500 transition-colors cursor-pointer w-48 shadow-md"
                    value={currentOrg?.id || ""}
                    onChange={(e) => switchOrganization(e.target.value)}
                  >
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>
                        Switch to: {org.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              onClick={() => navigate(`/workspaces`)}
              className="bg-[#1c1f2e] p-6 rounded-xl border border-[#ffffff]/10 hover:border-blue-500/50 transition-colors cursor-pointer group shadow-lg"
            >
              <div className="h-12 w-12 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FolderGit2 size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Workspaces</h3>
              <p className="text-slate-400">
                View, create, and manage development workspaces for this organization.
              </p>
            </div>
            <div
              onClick={() => navigate(`/organizations/${currentOrg.id}/members`)}
              className="bg-[#1c1f2e] p-6 rounded-xl border border-[#ffffff]/10 hover:border-blue-500/50 transition-colors cursor-pointer group shadow-lg"
            >
              <div className="h-12 w-12 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Members & Invitations</h3>
              <p className="text-slate-400">
                Manage organization members, invite new users, and update roles.
              </p>
            </div>

            {["OWNER", "ADMIN"].includes(currentOrg.myRole) && (
              <div className="bg-[#1c1f2e] p-6 rounded-xl border border-[#ffffff]/10 hover:border-blue-500/50 transition-colors cursor-pointer group shadow-lg">
                <div className="h-12 w-12 bg-orange-500/20 text-orange-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Settings size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">Settings</h3>
                <p className="text-slate-400">
                  Update organization details and transfer ownership safely.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrganizationDashboard;
