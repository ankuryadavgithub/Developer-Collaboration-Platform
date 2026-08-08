import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Folder, Plus, Calendar, Settings } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

const Projects = () => {
  const { orgId, workspaceId } = useParams();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Create form state
  const [newProject, setNewProject] = useState({ name: "", description: "", status: "ACTIVE" });

  useEffect(() => {
    fetchProjects();
  }, [workspaceId]);

  const fetchProjects = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/organizations/${orgId}/workspaces/${workspaceId}/projects`,
        { withCredentials: true }
      );
      if (res.data.success) {
        setProjects(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `http://localhost:5000/api/organizations/${orgId}/workspaces/${workspaceId}/projects`,
        newProject,
        { withCredentials: true }
      );
      setShowCreateModal(false);
      setNewProject({ name: "", description: "", status: "ACTIVE" });
      fetchProjects();
    } catch (err) {
      console.error("Failed to create project");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-[#111827] to-indigo-950">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main className="flex-1 p-4 w-full h-full overflow-y-auto min-w-0">
        <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <div className="max-w-7xl mx-auto mt-6">
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#ffffff]/10">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
                <Folder size={32} className="text-violet-500" /> Projects
              </h1>
              <p className="text-slate-400 mt-1">
                Manage all projects within this workspace
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-violet-600 hover:bg-violet-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Plus size={20} /> New Project
            </button>
          </div>

          {loading ? (
            <div className="text-white text-center py-10">Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className="text-center py-20 bg-[#1c1f2e] rounded-xl border border-[#ffffff]/10">
              <Folder size={48} className="mx-auto text-slate-500 mb-4" />
              <h2 className="text-xl font-bold mb-2 text-white">No Projects Found</h2>
              <p className="text-slate-400 mb-6">Create a project to start tracking your work.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-violet-600 hover:bg-violet-700 text-white font-bold py-2 px-6 rounded-lg transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <Plus size={20} /> Create Your First Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-[#1c1f2e] p-6 rounded-xl border border-[#ffffff]/10 hover:border-violet-500/50 transition-colors group flex flex-col h-full"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-12 w-12 bg-violet-500/20 text-violet-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                      <Folder size={24} />
                    </div>
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-full ${
                        project.status === "ACTIVE" 
                          ? "bg-green-500/20 text-green-400" 
                          : project.status === "COMPLETED" 
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-slate-700 text-slate-300"
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 line-clamp-1 text-white">
                    {project.name}
                  </h3>
                  <p className="text-slate-400 text-sm line-clamp-2 mb-4 flex-grow">
                    {project.description || "No description provided."}
                  </p>

                  <div className="pt-4 border-t border-[#ffffff]/10 flex items-center justify-between text-sm text-slate-400 mt-auto">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>
                        {new Date(project.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md bg-[#1c1f2e] rounded-2xl shadow-xl border border-slate-700 p-6 relative">
              <h2 className="text-2xl font-bold text-white mb-6">Create New Project</h2>
              <form onSubmit={handleCreateProject}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Project Name</label>
                  <input
                    required
                    type="text"
                    value={newProject.name}
                    onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                    className="w-full bg-[#0f111a] border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                    placeholder="e.g. Website Redesign"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                  <textarea
                    value={newProject.description}
                    onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                    className="w-full bg-[#0f111a] border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 min-h-[100px]"
                    placeholder="What is this project about?"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-violet-600 hover:bg-violet-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors cursor-pointer"
                  >
                    Create Project
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Projects;
