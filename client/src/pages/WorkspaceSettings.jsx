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
  const [initialData, setInitialData] = useState({ name: "", description: "" });
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
        const fetchedName = res.data.data.name || "";
        const fetchedDesc = res.data.data.description || "";
        setName(fetchedName);
        setDescription(fetchedDesc);
        setInitialData({ name: fetchedName, description: fetchedDesc });
      }
    } catch (error) {
      console.error("Failed to fetch workspace", error);
      setMessage({ text: "Failed to load workspace settings.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
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
      console.error("Failed to update workspace", error);
      setMessage({ text: error.response?.data?.message || "Failed to update workspace settings.", type: "error" });
    } finally {
      setSaving(false);
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
        <div className="text-white max-w-3xl mx-auto mt-6">
          <button
            onClick={() => navigate(`/organizations/${orgId}/workspaces/${workspaceId}/dashboard`)}
            className="text-slate-500 hover:text-white transition-colors text-lg mb-6 flex items-center gap-2"
          >
            ← Back to Workspace
          </button>

          <h1 className="text-3xl font-bold mb-8">Workspace Settings</h1>

          {message.text && (
            <div className={`p-4 rounded-lg mb-6 transition-all duration-300 ${message.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
              {message.text}
            </div>
          )}

          <div className="bg-[#1c1f2e] p-6 md:p-8 rounded-xl border border-[#ffffff]/10 shadow-lg">
            <h2 className="text-xl font-bold mb-6 border-b border-[#ffffff]/10 pb-4">General Settings</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-400 mb-2">
                  Workspace Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={50}
                  required
                  className="w-full bg-[#0f111a] border border-[#ffffff]/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Enter workspace name"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-400 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={255}
                  rows={4}
                  className="w-full bg-[#0f111a] border border-[#ffffff]/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  placeholder="Enter workspace description"
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
        </div>
      </main>
    </div>
  );
};

export default WorkspaceSettings;
