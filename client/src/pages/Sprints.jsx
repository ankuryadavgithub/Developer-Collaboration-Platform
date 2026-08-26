import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Play, Plus, CheckCircle, Clock, GripVertical } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

const Sprints = () => {
  const { orgId, workspaceId } = useParams();
  const [sprints, setSprints] = useState([]);
  const [backlogTasks, setBacklogTasks] = useState([]);
  const [sprintTasks, setSprintTasks] = useState([]);
  const [selectedSprintId, setSelectedSprintId] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSprint, setNewSprint] = useState({ name: "", goal: "", startDate: "", endDate: "" });

  useEffect(() => {
    fetchSprintsAndBacklog();
  }, [workspaceId]);

  // Fetch Sprints and Backlog tasks
  const fetchSprintsAndBacklog = async () => {
    try {
      setLoading(true);
      const [sprintsRes, backlogRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/organizations/${orgId}/workspaces/${workspaceId}/sprints`, { withCredentials: true }),
        axios.get(`http://localhost:5000/api/organizations/${orgId}/workspaces/${workspaceId}/tasks?sprintId=null`, { withCredentials: true })
      ]);
      
      const fetchedSprints = sprintsRes.data.data || [];
      setSprints(fetchedSprints);
      setBacklogTasks(backlogRes.data.data || []);
      
      // Auto-select the active or first planned sprint if none selected
      if (fetchedSprints.length > 0 && !selectedSprintId) {
        const active = fetchedSprints.find(s => s.status === 'ACTIVE');
        const planned = fetchedSprints.find(s => s.status === 'PLANNED');
        setSelectedSprintId(active ? active.id : (planned ? planned.id : fetchedSprints[0].id));
      }
    } catch (error) {
      console.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch tasks for the currently selected sprint
  useEffect(() => {
    if (selectedSprintId) {
      fetchSprintTasks();
    }
  }, [selectedSprintId]);

  const fetchSprintTasks = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/organizations/${orgId}/workspaces/${workspaceId}/tasks?sprintId=${selectedSprintId}`, { withCredentials: true });
      setSprintTasks(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch sprint tasks");
    }
  };

  const handleCreateSprint = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `http://localhost:5000/api/organizations/${orgId}/workspaces/${workspaceId}/sprints`,
        newSprint,
        { withCredentials: true }
      );
      setShowCreateModal(false);
      setNewSprint({ name: "", goal: "", startDate: "", endDate: "" });
      setSelectedSprintId(res.data.data.id); // Auto select new sprint
      fetchSprintsAndBacklog();
    } catch (err) {
      console.error("Failed to create sprint");
    }
  };

  const updateSprintStatus = async (status) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/organizations/${orgId}/workspaces/${workspaceId}/sprints/${selectedSprintId}`,
        { status },
        { withCredentials: true }
      );
      fetchSprintsAndBacklog(); // Refresh to update status badges
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update sprint.");
    }
  };

  // --- DRAG AND DROP LOGIC ---
  const onDragStart = (e, taskId, source) => {
    e.dataTransfer.setData("taskId", taskId);
    e.dataTransfer.setData("source", source);
  };

  const onDragOver = (e) => {
    e.preventDefault(); 
  };

  const onDrop = async (e, destination) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    const source = e.dataTransfer.getData("source");

    if (!taskId || source === destination) return; 
    
    // Ensure we have a selected sprint if dropping into sprint pane
    if (destination === "sprint" && !selectedSprintId) {
      alert("Please create or select a sprint first!");
      return;
    }

    const targetSprintId = destination === "sprint" ? selectedSprintId : null;

    // Optimistic UI Update
    let taskToMove;
    if (source === "backlog") {
      taskToMove = backlogTasks.find((t) => t.id === parseInt(taskId));
      if(!taskToMove) return;
      setBacklogTasks((prev) => prev.filter((t) => t.id !== parseInt(taskId)));
      setSprintTasks((prev) => [...prev, { ...taskToMove, sprintId: targetSprintId }]);
    } else {
      taskToMove = sprintTasks.find((t) => t.id === parseInt(taskId));
      if(!taskToMove) return;
      setSprintTasks((prev) => prev.filter((t) => t.id !== parseInt(taskId)));
      setBacklogTasks((prev) => [...prev, { ...taskToMove, sprintId: targetSprintId }]);
    }

    // Backend call
    try {
      await axios.patch(
        `http://localhost:5000/api/organizations/${orgId}/workspaces/${workspaceId}/tasks/${taskId}`,
        { sprintId: targetSprintId }, 
        { withCredentials: true }
      );
    } catch (err) {
      alert("Failed to move task.");
      fetchSprintsAndBacklog();
      fetchSprintTasks();
    }
  };

  const selectedSprint = sprints.find(s => s.id === parseInt(selectedSprintId));

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-[#111827] to-indigo-950">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main className="flex-1 p-4 w-full h-full overflow-y-auto min-w-0">
        <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <div className="max-w-7xl mx-auto mt-6">
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#ffffff]/10">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
                <Play size={32} className="text-violet-500" /> Sprint Planning
              </h1>
              <p className="text-slate-400 mt-1">
                Drag and drop tasks from your backlog to plan your sprints
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
            <div className="text-white text-center py-10">Loading planning board...</div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-6 h-[600px]">
              
              {/* LEFT PANE: BACKLOG */}
              <div 
                className="flex-1 bg-[#1c1f2e]/80 rounded-2xl border border-[#ffffff]/10 p-5 flex flex-col shadow-xl"
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, "backlog")}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    Product Backlog <span className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded-full">{backlogTasks.length}</span>
                  </h2>
                </div>
                
                <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                  {backlogTasks.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 border-2 border-dashed border-slate-700 rounded-xl">
                      Backlog is empty.
                    </div>
                  ) : (
                    backlogTasks.map(task => (
                      <div 
                        key={task.id} 
                        draggable 
                        onDragStart={(e) => onDragStart(e, task.id, "backlog")}
                        className="bg-[#0f111a] p-4 rounded-xl border border-slate-700/50 hover:border-violet-500/50 cursor-grab active:cursor-grabbing group transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <GripVertical size={16} className="text-slate-600 mt-1 shrink-0 group-hover:text-violet-400" />
                          <div>
                            <p className="text-white font-medium text-sm leading-snug">{task.title}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs font-semibold text-slate-500">
                              <span className="bg-[#1c1f2e] px-2 py-0.5 rounded">{task.priority}</span>
                              {task.storyPoints > 0 && <span className="bg-violet-500/10 text-violet-400 px-2 py-0.5 rounded">{task.storyPoints} pts</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* RIGHT PANE: SPRINT */}
              <div 
                className="flex-1 bg-gradient-to-b from-[#1c1f2e] to-[#0f111a] rounded-2xl border border-violet-500/20 p-5 flex flex-col shadow-xl"
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, "sprint")}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                  {sprints.length > 0 ? (
                    <select 
                      value={selectedSprintId} 
                      onChange={(e) => setSelectedSprintId(e.target.value)}
                      className="bg-[#0f111a] border border-violet-500/30 rounded-lg p-2.5 text-white font-bold outline-none focus:border-violet-500 cursor-pointer w-full sm:w-auto"
                    >
                      {sprints.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.status})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <h2 className="text-xl font-bold text-slate-400">No Sprints Created</h2>
                  )}

                  {selectedSprint && (
                    <div className="flex gap-2">
                      {selectedSprint.status === "PLANNED" && (
                        <button 
                          onClick={() => updateSprintStatus("ACTIVE")} 
                          className="bg-green-600/20 text-green-400 hover:bg-green-600 hover:text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm border border-green-500/20"
                        >
                          <Play size={16} /> Start Sprint
                        </button>
                      )}
                      {selectedSprint.status === "ACTIVE" && (
                        <button 
                          onClick={() => updateSprintStatus("COMPLETED")} 
                          className="bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm border border-blue-500/20"
                        >
                          <CheckCircle size={16} /> Complete
                        </button>
                      )}
                      {selectedSprint.status === "COMPLETED" && (
                        <span className="bg-slate-800 text-slate-400 font-semibold px-4 py-2 rounded-lg text-sm border border-slate-700">
                          Completed
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                  {!selectedSprintId ? (
                    <div className="text-center py-20 text-slate-500 border-2 border-dashed border-slate-700/50 rounded-xl flex flex-col items-center">
                      <Clock size={40} className="mb-3 opacity-50" />
                      <p>Create a sprint to start planning.</p>
                    </div>
                  ) : sprintTasks.length === 0 ? (
                    <div className="text-center py-20 text-slate-500 border-2 border-dashed border-violet-500/20 rounded-xl flex flex-col items-center">
                      <GripVertical size={40} className="mb-3 opacity-50 text-violet-400" />
                      <p>Drop tasks here to add them to this sprint.</p>
                    </div>
                  ) : (
                    sprintTasks.map(task => (
                      <div 
                        key={task.id} 
                        draggable={selectedSprint?.status !== "COMPLETED"} // Lock drag if completed
                        onDragStart={(e) => onDragStart(e, task.id, "sprint")}
                        className={`p-4 rounded-xl border transition-all ${
                          selectedSprint?.status === "COMPLETED" 
                          ? "bg-[#0f111a] border-slate-800 opacity-70"
                          : "bg-[#1c1f2e] border-violet-500/30 hover:border-violet-500 cursor-grab active:cursor-grabbing shadow-lg"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {selectedSprint?.status !== "COMPLETED" && (
                            <GripVertical size={16} className="text-violet-500/50 mt-1 shrink-0" />
                          )}
                          <div>
                            <p className="text-white font-medium text-sm leading-snug">{task.title}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs font-semibold text-slate-400">
                              <span className="bg-black/30 px-2 py-0.5 rounded border border-white/5">{task.status}</span>
                              {task.storyPoints > 0 && <span className="text-violet-400">{task.storyPoints} pts</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-[#1c1f2e] rounded-2xl shadow-2xl border border-slate-700 p-6 relative">
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
                    className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer font-semibold"
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
