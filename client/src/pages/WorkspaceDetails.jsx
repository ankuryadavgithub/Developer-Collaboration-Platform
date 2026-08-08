import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useOrganization } from "../context/OrganizationContext";
import {
  FolderGit2,
  Users,
  Settings,
  GitBranch,
  ExternalLink,
} from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

const WorkspaceDetails = () => {
  const { orgId, workspaceId } = useParams();
  const { currentOrg } = useOrganization();
  const navigate = useNavigate();

  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkspace();
  }, [workspaceId]);

  const fetchWorkspace = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/organizations/${orgId}/workspaces/${workspaceId}`,
        { withCredentials: true },
      );
      if (res.data.success) {
        setWorkspace(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch workspace");
    } finally {
      setLoading(false);
    }
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (loading)
    return <div className="p-8 text-white flex h-screen items-center justify-center">Loading Workspace...</div>;
  if (!workspace)
    return <div className="p-8 text-white">Workspace not found.</div>;

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-[#111827] to-indigo-950">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main className="flex-1 p-4 md:p-8 w-full h-full overflow-y-auto min-w-0">
        <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="text-white max-w-5xl mx-auto mt-6">
          <div className="mb-8">
            <button
              onClick={() => navigate("/workspaces")}
              className="text-slate-500 hover:text-white transition-colors text-xl mb-4"
            >
              ← Back to Workspaces
            </button>
            <div className="flex items-center gap-4 pb-6 border-b border-[#ffffff]/10">
              <div className="h-16 w-16 bg-blue-600/20 text-blue-500 rounded-2xl flex items-center justify-center shrink-0">
                <FolderGit2 size={32} />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold">{workspace.name}</h1>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${workspace.status === "ACTIVE" ? "bg-green-500/20 text-green-400" : "bg-slate-700 text-slate-300"}`}
                  >
                    {workspace.status}
                  </span>
                </div>
                <p className="text-slate-400 mt-1">
                  {workspace.description || "No description provided."}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div
              onClick={() =>
                navigate(
                  `/organizations/${orgId}/workspaces/${workspaceId}/members`,
                )
              }
              className="bg-[#1c1f2e] p-6 rounded-xl border border-[#ffffff]/10 hover:border-blue-500/50 transition-colors cursor-pointer group shadow-lg"
            >
              <div className="h-12 w-12 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Workspace Members</h3>
              <p className="text-slate-400">
                Add organization members to this workspace and manage their access
                roles.
              </p>
            </div>

            <div className="bg-[#1c1f2e] p-6 rounded-xl border border-[#ffffff]/10 opacity-75 cursor-not-allowed group relative overflow-hidden shadow-lg">
              <div className="absolute top-0 right-0 bg-orange-500/20 text-orange-400 text-xs font-bold px-3 py-1 rounded-bl-lg">
                Coming Soon
              </div>
              <div className="h-12 w-12 bg-orange-500/20 text-orange-400 rounded-xl flex items-center justify-center mb-4">
                <Settings size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Workspace Settings</h3>
              <p className="text-slate-400">
                Archive this workspace or update its configuration.
              </p>
            </div>
          </div>

          <div className="bg-[#1c1f2e] rounded-xl border border-[#ffffff]/10 overflow-hidden shadow-lg">
            <div className="p-6 border-b border-[#ffffff]/10 flex items-center gap-3">
              <GitBranch size={24} className="text-slate-400" />
              <h2 className="text-xl font-bold">Connected Repository</h2>
            </div>

            {workspace.repository ? (
              <div className="p-6 grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Repository Name</p>
                  <p className="font-bold text-lg">
                    {workspace.repository.fullName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Visibility</p>
                  <p className="font-medium capitalize">
                    {workspace.repository.visibility}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">Default Branch</p>
                  <p className="font-medium inline-block bg-slate-800 px-2 rounded text-blue-300">
                    {workspace.repository.defaultBranch}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400 mb-1">GitHub Link</p>
                  <a
                    href={workspace.repository.htmlUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-500 hover:text-blue-400 flex items-center gap-1 transition-colors w-fit"
                  >
                    Open in GitHub <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            ) : (
              <div className="p-6 text-slate-400">No repository connected.</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default WorkspaceDetails;
