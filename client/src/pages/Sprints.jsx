import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Play, Plus, CheckCircle, Clock } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

const Sprints = () => {
  const { orgId, workspaceId } = useParams();
  const navigate = useNavigate();
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Create form state
  const [newSprint, setNewSprint] = useState({ name: "", goal: "", startDate: "", endDate: "" });

  useEffect(() => {
    fetchSprints();
  }, [workspaceId]);

  const fetchSprints = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/organizations/${orgId}/workspaces/${workspaceId}/sprints`,
        { withCredentials: true }
      );
      if (res.data.success) {
        setSprints(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch sprints");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSprint = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `http://localhost:5000/api/organizations/${orgId}/workspaces/${workspaceId}/sprints`,
        newSprint,
        { withCredentials: true }
      );
      setShowCreateModal(false);
      setNewSprint({ name: "", goal: "", startDate: "", endDate: "" });
      fetchSprints();
    } catch (err) {
      console.error("Failed to create sprint");
    }
  };

  const handleStartSprint = async (sprintId) => {
    try {
      await axios.post(
        `http://localhost:5000/api/organizations/${orgId}/workspaces/${workspaceId}/sprints/${sprintId}/start`,
        {},
        { withCredentials: true }
      );
      fetchSprints();
    } catch (err) {
      alert("Cannot start this sprint. Make sure no other sprint is currently active.");
    }
  };

  const handleCompleteSprint = async (sprintId) => {
    try {
      await axios.post(
        `http://localhost:5000/api/organizations/${orgId}/workspaces/${workspaceId}/sprints/${sprintId}/complete`,
        {},
        { withCredentials: true }
      );
      fetchSprints();
    } catch (err) {
      alert("Failed to complete sprint.");
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
                <Play size={32} className="text-violet-500" /> Sprints
              </h1>
              <p className="text-slate-400 mt-1">
                Plan and manage agile sprints
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-violet-600 hover:bg-violet-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Plus size={20} /> New Sprint
            </button>
          </div>

          {loading ? (
            <div className="text-white text-center py-10">Loading sprints...</div>
          ) : sprints.length === 0 ? (
            <div className="text-center py-20 bg-[#1c1f2e] rounded-xl border border-[#ffffff]/10">
              <Play size={48} className="mx-auto text-slate-500 mb-4" />
              <h2 className="text-xl font-bold mb-2 text-white">No Sprints Found</h2>
              <p className="text-slate-400 mb-6">Create a sprint to group your tasks into timeboxes.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-violet-600 hover:bg-violet-700 text-white font-bold py-2 px-6 rounded-lg transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <Plus size={20} /> Create Your First Sprint
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sprints.map((sprint) => (
                <div
                  key={sprint.id}
                  className="bg-[#1c1f2e] p-6 rounded-xl border border-[#ffffff]/10 hover:border-violet-500/50 transition-colors group flex flex-col h-full"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-12 w-12 bg-violet-500/20 text-violet-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                      <Clock size={24} />
                    </div>
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-full ${
                        sprint.status === "ACTIVE" 
                          ? "bg-green-500/20 text-green-400" 
                          : sprint.status === "COMPLETED" 
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-slate-700 text-slate-300"
                      }`}
                    >
                      {sprint.status}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 line-clamp-1 text-white">
                    {sprint.name}
                  </h3>
                  <p className="text-slate-400 text-sm line-clamp-2 mb-4 flex-grow">
                    {sprint.goal || "No goal specified."}
                  </p>

                  <div className="pt-4 border-t border-[#ffffff]/10 flex flex-col text-sm text-slate-400 mt-auto gap-3">
                    <div className="flex items-center justify-between">
                      <span>Start: {new Date(sprint.startDate).toLocaleDateString()}</span>
                      <span>End: {new Date(sprint.endDate).toLocaleDateString()}</span>
                    </div>

                    {sprint.status === "PLANNED" && (
                      <button
                        onClick={() => handleStartSprint(sprint.id)}
                        className="w-full bg-green-600/20 text-green-400 hover:bg-green-600 hover:text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <Play size={16} /> Start Sprint
                      </button>
                    )}

                    {sprint.status === "ACTIVE" && (
                      <button
                        onClick={() => handleCompleteSprint(sprint.id)}
                        className="w-full bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <CheckCircle size={16} /> Complete Sprint
                      </button>
                    )}
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
              <h2 className="text-2xl font-bold text-white mb-6">Create New Sprint</h2>
              <form onSubmit={handleCreateSprint}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Sprint Name</label>
                  <input
                    required
                    type="text"
                    value={newSprint.name}
                    onChange={(e) => setNewSprint({...newSprint, name: e.target.value})}
                    className="w-full bg-[#0f111a] border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                    placeholder="e.g. Sprint 1"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Sprint Goal</label>
                  <textarea
                    value={newSprint.goal}
                    onChange={(e) => setNewSprint({...newSprint, goal: e.target.value})}
                    className="w-full bg-[#0f111a] border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 min-h-[80px]"
                    placeholder="What is the main objective?"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Start Date</label>
                    <input
                      required
                      type="date"
                      value={newSprint.startDate}
                      onChange={(e) => setNewSprint({...newSprint, startDate: e.target.value})}
                      className="w-full bg-[#0f111a] border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">End Date</label>
                    <input
                      required
                      type="date"
                      value={newSprint.endDate}
                      onChange={(e) => setNewSprint({...newSprint, endDate: e.target.value})}
                      className="w-full bg-[#0f111a] border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                    />
                  </div>
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
                    Create Sprint
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

export default Sprints;
