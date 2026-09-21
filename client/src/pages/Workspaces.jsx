import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useOrganization } from "../context/OrganizationContext";
import { FolderGit2, Plus, GitBranch } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

const Workspaces = () => {
  const { currentOrg } = useOrganization();
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentOrg) fetchWorkspaces();
  }, [currentOrg]);

  const fetchWorkspaces = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/organizations/${currentOrg.id}/workspaces`,
        { withCredentials: true },
      );
      if (res.data.success) {
        setWorkspaces(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch workspaces");
    } finally {
      setLoading(false);
    }
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!currentOrg)
    return (
      <div className="p-8 text-white">Please select an organization first.</div>
    );
  if (loading)
    return <div className="min-h-screen bg-[#0f111a] p-8 text-white flex items-center justify-center">Loading workspaces...</div>;

  // Organization members cannot create workspaces. Managers, Admins, and Owners can.
  const canCreate = ["OWNER", "ADMIN", "MANAGER"].includes(currentOrg.myRole);

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-[#111827] to-indigo-950">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main className="flex-1 p-4 md:p-8 w-full h-full overflow-y-auto min-w-0">
        <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="text-white max-w-6xl mx-auto mt-6">
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#ffffff]/10">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <FolderGit2 size={32} className="text-blue-500" /> Workspaces
              </h1>
              <p className="text-slate-400 mt-1">
                Manage development environments for {currentOrg.name}
              </p>
            </div>
            {canCreate && (
              <button
                onClick={() =>
                  navigate(`/organizations/${currentOrg.id}/workspaces/create`)
                }
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors cursor-pointer shadow-lg"
              >
                <Plus size={20} /> Create Workspace
              </button>
            )}
          </div>

          {workspaces.length === 0 ? (
            <div className="text-center py-20 bg-[#1c1f2e] rounded-xl border border-[#ffffff]/10 shadow-lg">
              <FolderGit2 size={48} className="mx-auto text-slate-500 mb-4" />
              <h2 className="text-xl font-bold mb-2">No Workspaces Found</h2>
              <p className="text-slate-400 mb-6">
                Create a workspace to connect a GitHub repository and start
                collaborating.
              </p>
              {canCreate && (
                <button
                  onClick={() =>
                    navigate(`/organizations/${currentOrg.id}/workspaces/create`)
                  }
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors inline-flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Plus size={20} /> Create Your First Workspace
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workspaces.map((workspace) => (
                <div
                  key={workspace.id}
                  onClick={() =>
                    navigate(
                      `/organizations/${currentOrg.id}/workspaces/${workspace.id}/dashboard`,
                    )
                  }
                  className="bg-[#1c1f2e] p-6 rounded-xl border border-[#ffffff]/10 hover:border-blue-500/50 transition-colors cursor-pointer group flex flex-col h-full shadow-lg"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-12 w-12 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                      <FolderGit2 size={24} />
                    </div>
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-full ${workspace.status === "ACTIVE" ? "bg-green-500/20 text-green-400" : "bg-slate-700 text-slate-300"}`}
                    >
                      {workspace.status}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 line-clamp-1">
                    {workspace.name}
                  </h3>
                  <p className="text-slate-400 text-sm line-clamp-2 mb-4 flex-grow">
                    {workspace.description || "No description provided."}
                  </p>

                  <div className="pt-4 border-t border-[#ffffff]/10 flex items-center justify-between text-sm text-slate-400 mt-auto">
                    <div className="flex items-center gap-2">
                      <GitBranch size={16} />
                      <span
                        className="truncate w-32"
                        title={workspace.repository?.name}
                      >
                        {workspace.repository?.name || "No Repo"}
                      </span>
                    </div>
                    <div>{workspace._count.members} Members</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Workspaces;
