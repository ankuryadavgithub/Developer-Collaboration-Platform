import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Folder, Plus, AlertCircle, CheckCircle2 } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

const COLUMNS = [
  { id: "TODO", title: "To Do", color: "border-slate-500" },
  { id: "IN_PROGRESS", title: "In Progress", color: "border-blue-500" },
  { id: "IN_REVIEW", title: "In Review", color: "border-purple-500" },
  { id: "DONE", title: "Done", color: "border-green-500" },
];

const ProjectDetails = () => {
  const { orgId, workspaceId, projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Create task modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", type: "FEATURE", priority: "MEDIUM" });

  useEffect(() => {
    fetchProjectAndTasks();
  }, [projectId]);

  const fetchProjectAndTasks = async () => {
    try {
      setLoading(true);
      const [projRes, tasksRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/organizations/${orgId}/workspaces/${workspaceId}/projects/${projectId}`, { withCredentials: true }),
        axios.get(`http://localhost:5000/api/organizations/${orgId}/workspaces/${workspaceId}/tasks?projectId=${projectId}`, { withCredentials: true })
      ]);
      
      if (projRes.data.success) {
        setProject(projRes.data.data);
      }
      if (tasksRes.data.success) {
        setTasks(tasksRes.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch project details");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `http://localhost:5000/api/organizations/${orgId}/workspaces/${workspaceId}/tasks`,
        { ...newTask, projectId },
        { withCredentials: true }
      );
      setShowCreateModal(false);
      setNewTask({ title: "", description: "", type: "FEATURE", priority: "MEDIUM" });
      fetchProjectAndTasks();
    } catch (err) {
      console.error("Failed to create task");
      alert(err.response?.data?.message || "Failed to create task.");
    }
  };

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    const taskId = parseInt(e.dataTransfer.getData("taskId"));
    
    // Optimistic UI update
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    
    try {
      await axios.patch(
        `http://localhost:5000/api/organizations/${orgId}/workspaces/${workspaceId}/tasks/${taskId}`,
        { status: newStatus },
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Failed to update task status");
      fetchProjectAndTasks(); // Revert on failure
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-[#111827] to-indigo-950">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main className="flex-1 p-4 w-full h-full overflow-y-auto min-w-0">
        <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <div className="max-w-[1600px] mx-auto mt-6 h-[calc(100vh-140px)] flex flex-col">
          <div className="flex items-center justify-between mb-6 shrink-0">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
                <Folder size={32} className="text-violet-500" /> {project ? project.name : "Loading Project..."}
              </h1>
              <p className="text-slate-400 mt-1">
                {project?.description || "Manage project tasks"}
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-violet-600 hover:bg-violet-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Plus size={20} /> Add Task
            </button>
          </div>

          {loading ? (
            <div className="text-white text-center py-10">Loading project...</div>
          ) : (
            <div className="flex gap-6 overflow-x-auto pb-4 flex-1">
              {COLUMNS.map(column => {
                const columnTasks = tasks.filter(t => t.status === column.id);
                return (
                  <div 
                    key={column.id}
                    className="flex-shrink-0 w-80 bg-[#1c1f2e]/80 rounded-xl border border-slate-800 flex flex-col overflow-hidden"
                    onDrop={(e) => handleDrop(e, column.id)}
                    onDragOver={handleDragOver}
                  >
                    <div className={`p-4 border-t-4 ${column.color} bg-[#111827] border-b border-slate-800 flex justify-between items-center shrink-0`}>
                      <h3 className="font-bold text-slate-200">{column.title}</h3>
                      <span className="bg-slate-800 text-slate-400 text-xs px-2 py-1 rounded-full font-medium">
                        {columnTasks.length}
                      </span>
                    </div>
                    
                    <div className="p-3 flex-1 overflow-y-auto space-y-3 min-h-[150px]">
                      {columnTasks.map(task => (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          className="bg-[#242938] p-4 rounded-lg border border-slate-700 hover:border-violet-500/50 cursor-grab active:cursor-grabbing shadow-sm"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-semibold text-slate-400">
                              {task.key || `TASK-${task.id}`}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider ${
                              task.priority === "HIGH" ? "bg-red-500/20 text-red-400" :
                              task.priority === "LOW" ? "bg-blue-500/20 text-blue-400" :
                              "bg-yellow-500/20 text-yellow-400"
                            }`}>
                              {task.priority}
                            </span>
                          </div>
                          
                          <h4 className="text-sm font-semibold text-white mb-2 leading-tight">
                            {task.title}
                          </h4>
                          
                          {task.description && (
                            <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                              {task.description}
                            </p>
                          )}
                          
                          <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-700/50">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                              {task.type === "BUG" ? <AlertCircle size={14} className="text-red-400" /> : <CheckCircle2 size={14} className="text-blue-400" />}
                              {task.type}
                            </div>
                            
                            {task.assignee && (
                              <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center text-[10px] font-bold text-white border border-slate-800" title={task.assignee.username}>
                                {task.assignee.username.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {columnTasks.length === 0 && (
                        <div className="h-full w-full flex items-center justify-center border-2 border-dashed border-slate-800 rounded-lg text-sm text-slate-500 font-medium p-4 text-center">
                          Drop tasks here
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Create Task Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md bg-[#1c1f2e] rounded-2xl shadow-xl border border-slate-700 p-6 relative">
              <h2 className="text-2xl font-bold text-white mb-6">Create Task in {project?.name}</h2>
              <form onSubmit={handleCreateTask}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
                  <input
                    required
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    className="w-full bg-[#0f111a] border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                    placeholder="e.g. Update login page UI"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    className="w-full bg-[#0f111a] border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 min-h-[80px]"
                    placeholder="Provide context..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Type</label>
                    <select
                      value={newTask.type}
                      onChange={(e) => setNewTask({...newTask, type: e.target.value})}
                      className="w-full bg-[#0f111a] border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-violet-500"
                    >
                      <option value="FEATURE">Feature</option>
                      <option value="BUG">Bug</option>
                      <option value="CHORE">Chore</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Priority</label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                      className="w-full bg-[#0f111a] border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-violet-500"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
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
                    Create Task
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

export default ProjectDetails;
