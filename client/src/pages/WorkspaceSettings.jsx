import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useOrganization } from "../context/OrganizationContext";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

const WorkspaceSettings = () => {
  const { orgId, workspaceId } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [repository, setRepository] = useState(null);
  const [repoUrl, setRepoUrl] = useState("");

  const [status, setStatus] = useState("ACTIVE");
  const [previousRepo, setPreviousRepo] = useState(null);
  const [initialData, setInitialData] = useState({ name: "", description: "" });
  const [myRole, setMyRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Auto-hide success message
  useEffect(() => {
    if (message.type === 'success' && message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: "", type: "" });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    fetchWorkspace();
  }, [workspaceId]);

  const fetchWorkspace = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/organizations/${orgId}/workspaces/${workspaceId}`,
        { withCredentials: true }
      );
      if (res.data.success) {
        if (res.data.myRole === "VIEWER") {
          navigate(`/organizations/${orgId}/workspaces/${workspaceId}/dashboard`);
          return;
        }
        
        const data = res.data.data;
        const fetchedName = data.name || "";
        const fetchedDesc = data.description || "";
        setName(fetchedName);
        setDescription(fetchedDesc);
        setStatus(data.status || "ACTIVE");
        setInitialData({ name: fetchedName, description: fetchedDesc });
        setRepository(data.repository || null);
        setMyRole(res.data.myRole);
      }
    } catch (error) {
      console.error("Failed to fetch workspace", error);
      setMessage({ text: "Failed to load workspace settings.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGeneral = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await axios.patch(
        `http://localhost:5000/api/organizations/${orgId}/workspaces/${workspaceId}`,
        { name: name.trim(), description: description.trim() },
        { withCredentials: true }
      );
      if (res.data.success) {
        setInitialData({ name: name.trim(), description: description.trim() });
        setMessage({ text: "Workspace settings updated successfully!", type: "success" });
      }
    } catch (error) {
      setMessage({ text: error.response?.data?.message || "Failed to update settings.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleConnectRepo = async (e, urlToConnect = repoUrl) => {
    if (e) e.preventDefault();
    setMessage({ text: "", type: "" });
    try {
      const res = await axios.post(
        `http://localhost:5000/api/organizations/${orgId}/workspaces/${workspaceId}/repository`,
        { githubUrl: urlToConnect },
        { withCredentials: true }
      );
      if (res.data.success) {
        setMessage({ text: "Repository connected successfully!", type: "success" });
        setRepository(res.data.data);
        setPreviousRepo(null); // Clear previous repo once successfully connected
        setRepoUrl("");
      }
    } catch (error) {
      setMessage({ text: error.response?.data?.message || "Failed to connect repo", type: "error" });
    }
  };

  const handleRemoveRepo = async () => {
    if (!window.confirm("Are you sure you want to disconnect this repository?")) return;
    setMessage({ text: "", type: "" });
    try {
      const res = await axios.delete(
        `http://localhost:5000/api/organizations/${orgId}/workspaces/${workspaceId}/repository`,
        { withCredentials: true }
      );
      if (res.data.success) {
        setMessage({ text: "Repository disconnected successfully!", type: "success" });
        setPreviousRepo(repository); // Remember the disconnected repo
        setRepository(null);
      }
    } catch (error) {
      setMessage({ text: error.response?.data?.message || "Failed to disconnect repo", type: "error" });
    }
  };

  const handleToggleArchive = async () => {
    const isArchived = status === 'ARCHIVED';
    const action = isArchived ? "restore" : "archive";
    if (!window.confirm(`Are you sure you want to ${action} this workspace?`)) return;
    try {
      const res = await axios.patch(
        `http://localhost:5000/api/organizations/${orgId}/workspaces/${workspaceId}/${isArchived ? 'unarchive' : 'archive'}`,
        {},
        { withCredentials: true }
      );
      if (res.data.success) {
        setStatus(isArchived ? "ACTIVE" : "ARCHIVED");
        setMessage({ text: `Workspace ${isArchived ? 'restored' : 'archived'} successfully!`, type: "success" });
      }
    } catch (error) {
      setMessage({ text: `Failed to ${action} workspace`, type: "error" });
    }
  };

  const hasChanges = name.trim() !== initialData.name || description.trim() !== initialData.description;

  if (loading)
    return <div className="p-8 text-white flex h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-[#111827] to-indigo-950">Loading Workspace Settings...</div>;

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-[#111827] to-indigo-950">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main className="flex-1 p-4 md:p-8 w-full h-full overflow-y-auto min-w-0">
        <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="text-white max-w-3xl mx-auto mt-6 pb-12">
          <button
            onClick={() => navigate(`/organizations/${orgId}/workspaces/${workspaceId}/dashboard`)}
            className="text-slate-500 hover:text-white transition-colors text-lg mb-6 flex items-center gap-2"
          >
            ← Back to Workspace
          </button>

          <div className="flex flex-wrap items-center gap-4 mb-8">
            <h1 className="text-3xl font-bold">Workspace Settings</h1>
            {status === "ARCHIVED" && (
              <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase">
                Archived
              </span>
            )}
          </div>

          {message.text && (
            <div className={`p-4 rounded-lg mb-6 transition-all duration-300 ${message.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
              {message.text}
            </div>
          )}

          {/* General Settings */}
          <div className={`bg-[#1c1f2e] p-6 md:p-8 rounded-xl border border-[#ffffff]/10 shadow-lg ${status === "ARCHIVED" ? "opacity-60 pointer-events-none" : ""}`}>
            <h2 className="text-xl font-bold mb-6 border-b border-[#ffffff]/10 pb-4">General Settings</h2>
            
            <form onSubmit={handleUpdateGeneral} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Workspace Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={50}
                  required
                  className="w-full bg-[#0f111a] border border-[#ffffff]/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={255}
                  rows={4}
                  className="w-full bg-[#0f111a] border border-[#ffffff]/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                />
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={saving || !name.trim() || !hasChanges}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>

          {/* Repository Configuration */}
          {myRole === "WORKSPACE_ADMIN" && (
            <div className={`bg-[#1c1f2e] p-6 md:p-8 rounded-xl border border-[#ffffff]/10 shadow-lg mt-8 ${status === "ARCHIVED" ? "opacity-60 pointer-events-none" : ""}`}>
              <h2 className="text-xl font-bold mb-6 border-b border-[#ffffff]/10 pb-4">Repository Configuration</h2>
              
              {repository ? (
                <div className="bg-[#0f111a] p-4 rounded-lg border border-[#ffffff]/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="w-full min-w-0">
                    <p className="text-white font-bold truncate">{repository.fullName}</p>
                    <a href={repository.htmlUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-400 hover:underline block truncate">
                      {repository.htmlUrl}
                    </a>
                  </div>
                  <button
                    onClick={handleRemoveRepo}
                    className="w-full sm:w-auto bg-red-500/10 text-red-500 hover:bg-red-500/20 px-4 py-2 rounded-lg font-medium transition-colors shrink-0"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {previousRepo && (
                    <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="w-full min-w-0">
                        <p className="text-sm text-blue-300 mb-1">Previously connected to</p>
                        <p className="text-white font-bold truncate">{previousRepo.fullName}</p>
                      </div>
                      <button
                        onClick={(e) => handleConnectRepo(e, previousRepo.htmlUrl)}
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm shrink-0"
                      >
                        Reconnect
                      </button>
                    </div>
                  )}
                  
                  <div>
                    {previousRepo && <p className="text-sm text-slate-400 mb-4 text-center">--- OR ---</p>}
                    <label className="block text-sm font-medium text-slate-400 mb-2">Connect a new repository</label>
                    <form onSubmit={handleConnectRepo} className="flex flex-col sm:flex-row gap-4">
                      <input
                        type="url"
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
                        placeholder="https://github.com/owner/repo"
                        required
                        className="flex-1 bg-[#0f111a] border border-[#ffffff]/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 w-full"
                      />
                      <button
                        type="submit"
                        className="w-full sm:w-auto bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 sm:py-2 px-6 rounded-lg transition-colors"
                      >
                        Connect
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Danger Zone */}
          {myRole === "WORKSPACE_ADMIN" && (
            <div className="bg-red-950/20 p-6 md:p-8 rounded-xl border border-red-500/30 shadow-lg mt-8">
              <h2 className="text-xl font-bold mb-2 text-red-500">Danger Zone</h2>
              <p className="text-slate-400 mb-6 border-b border-red-500/20 pb-4">
                Destructive actions for this workspace. Proceed with caution.
              </p>
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-white font-medium">{status === "ARCHIVED" ? "Restore Workspace" : "Archive Workspace"}</h3>
                  <p className="text-sm text-slate-400">
                    {status === "ARCHIVED" 
                      ? "Restore this workspace to make it active and editable again." 
                      : "Soft delete this workspace. It will be hidden from everyone's dashboard."}
                  </p>
                </div>
                <button
                  onClick={handleToggleArchive}
                  className={`w-full md:w-auto text-center ${status === "ARCHIVED" ? 'bg-orange-500/10 text-orange-400 border-orange-500/30 hover:bg-orange-500/20' : 'bg-red-500/10 text-red-500 border-red-500/30 hover:bg-red-500/20'} border font-bold py-3 md:py-2 px-6 rounded-lg transition-colors whitespace-nowrap`}
                >
                  {status === "ARCHIVED" ? "Restore Workspace" : "Archive Workspace"}
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default WorkspaceSettings;
