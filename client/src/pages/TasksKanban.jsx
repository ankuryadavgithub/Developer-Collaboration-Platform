import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ListTodo, Plus, GripVertical, AlertCircle, CheckCircle2, User, Calendar, Star, GitPullRequest } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

const COLUMNS = [
  { id: "TODO", title: "To Do", color: "border-slate-500" },
  { id: "IN_PROGRESS", title: "In Progress", color: "border-blue-500" },
  { id: "IN_REVIEW", title: "In Review", color: "border-purple-500" },
  { id: "DONE", title: "Done", color: "border-green-500" },
];

const TasksKanban = () => {
  const { orgId, workspaceId } = useParams();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [activePRs, setActivePRs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Create task modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", type: "FEATURE", priority: "MEDIUM", projectId: "" });

  // Edit task modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    fetchTasks();
    fetchProjects();
    fetchMembers();
    fetchActivePRs();
  }, [orgId, workspaceId]);

  const fetchActivePRs = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/organizations/${orgId}/workspaces/${workspaceId}/github/pull-requests`,
        { withCredentials: true }
      );
      if (res.data.success) {
        setActivePRs(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch PRs for Kanban", error);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/organizations/${orgId}/workspaces/${workspaceId}/tasks`,
        { withCredentials: true }
      );
      if (res.data.success) {
        setTasks(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

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
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/organizations/${orgId}/workspaces/${workspaceId}/members`,
        { withCredentials: true }
      );
      if (res.data.success) {
        setMembers(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch members");
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.projectId) {
      alert("Please select a project first! If you don't have one, go to the Projects tab to create one.");
      return;
    }
    try {
      await axios.post(
        `http://localhost:5000/api/organizations/${orgId}/workspaces/${workspaceId}/tasks`,
        newTask,
        { withCredentials: true }
      );
      setShowCreateModal(false);
      // Preserve projectId so user doesn't have to re-select it
      setNewTask({ title: "", description: "", type: "FEATURE", priority: "MEDIUM", projectId: newTask.projectId });
      fetchTasks();
    } catch (err) {
      console.error("Failed to create task");
      alert(err.response?.data?.message || "Failed to create task.");
    }
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        assigneeId: selectedTask.assigneeId || null,
        storyPoints: selectedTask.storyPoints ? parseInt(selectedTask.storyPoints) : 0,
        dueDate: selectedTask.dueDate || null,
      };

      await axios.patch(
        `http://localhost:5000/api/organizations/${orgId}/workspaces/${workspaceId}/tasks/${selectedTask.id}`,
        updateData,
        { withCredentials: true }
      );
      setShowEditModal(false);
      fetchTasks();
    } catch (err) {
      console.error("Failed to update task");
      alert(err.response?.data?.message || "Failed to update task.");
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
      fetchTasks(); // Revert on failure
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const openEditModal = (task) => {
    setSelectedTask({
      ...task,
      assigneeId: task.assignee?.id || "",
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : "",
    });
    setShowEditModal(true);
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
                <ListTodo size={32} className="text-violet-500" /> Kanban Board
              </h1>
              <p className="text-slate-400 mt-1">
                Drag and drop tasks, or click a task to assign and edit details.
              </p>
            </div>
            <button
              onClick={() => {
                if (projects.length === 0) {
                  alert("You need to create a Project first before adding tasks! Go to the 'Projects' tab.");
                  return;
                }
                setShowCreateModal(true);
              }}
              className="bg-violet-600 hover:bg-violet-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Plus size={20} /> Add Task
            </button>
          </div>

          {loading ? (
            <div className="text-white text-center py-10">Loading board...</div>
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
                      {columnTasks.map(task => {
                        const taskKey = task.key || `TASK-${task.id}`;
                        const linkedPR = activePRs.find(pr => pr.title.includes(taskKey));
                        return (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          onClick={() => openEditModal(task)}
                          className="bg-[#242938] p-4 rounded-lg border border-slate-700 hover:border-violet-500/50 cursor-grab active:cursor-grabbing shadow-sm transition-colors"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-semibold text-slate-400">
                              {taskKey}
                            </span>
                            <div className="flex items-center gap-2 flex-wrap justify-end">
                              {linkedPR && (
                                <a 
                                  href={linkedPR.url} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm flex items-center gap-1 border hover:opacity-80 transition-opacity ${
                                    linkedPR.status === "Review" 
                                      ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                      : linkedPR.status === "Draft"
                                      ? "bg-slate-500/10 text-slate-400 border-slate-500/20"
                                      : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                  }`}
                                  title={`Linked PR: ${linkedPR.title}`}
                                >
                                  <GitPullRequest size={10} /> {linkedPR.status === "Draft" ? "Draft PR" : linkedPR.status === "Review" ? "PR Review" : "PR Open"}
                                </a>
                              )}
                              {task.storyPoints > 0 && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-violet-500/20 text-violet-400 flex items-center gap-1">
                                  <Star size={10} /> {task.storyPoints}
                                </span>
                              )}
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider ${
                                task.priority === "HIGH" ? "bg-red-500/20 text-red-400" :
                                task.priority === "LOW" ? "bg-blue-500/20 text-blue-400" :
                                "bg-yellow-500/20 text-yellow-400"
                              }`}>
                                {task.priority}
                              </span>
                            </div>
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
                              <img 
                                src={task.assignee.avatar || `https://ui-avatars.com/api/?name=${task.assignee.username}&background=6d28d9&color=fff`} 
                                alt={task.assignee.username}
                                title={task.assignee.username}
                                className="w-6 h-6 rounded-full border border-slate-800 object-cover"
                              />
                            )}
                          </div>
                        </div>
                      );})}
                      
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
              <h2 className="text-2xl font-bold text-white mb-6">Create New Task</h2>
              <form onSubmit={handleCreateTask}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Project</label>
                  <select
                    required
                    value={newTask.projectId || ""}
                    onChange={(e) => setNewTask({...newTask, projectId: e.target.value})}
                    className="w-full bg-[#0f111a] border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-violet-500"
                  >
                    <option value="" disabled>Select a project...</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
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

        {/* Edit Task Modal */}
        {showEditModal && selectedTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-[#1c1f2e] rounded-2xl shadow-xl border border-slate-700 p-6 relative">
              <h2 className="text-2xl font-bold text-white mb-2">Edit Task</h2>
              <p className="text-sm text-slate-400 mb-6">{selectedTask.title}</p>
              
              <form onSubmit={handleUpdateTask}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                    <User size={16} /> Assignee
                  </label>
                  <select
                    value={selectedTask.assigneeId || ""}
                    onChange={(e) => setSelectedTask({...selectedTask, assigneeId: e.target.value})}
                    className="w-full bg-[#0f111a] border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-violet-500"
                  >
                    <option value="">Unassigned</option>
                    {members.map(m => (
                      <option key={m.user.id} value={m.user.id}>
                        {m.user.username} {m.role === "ADMIN" ? "(Admin)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                      <Star size={16} /> Story Points
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={selectedTask.storyPoints || 0}
                      onChange={(e) => setSelectedTask({...selectedTask, storyPoints: e.target.value})}
                      className="w-full bg-[#0f111a] border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                      <Calendar size={16} /> Due Date
                    </label>
                    <input
                      type="date"
                      value={selectedTask.dueDate || ""}
                      onChange={(e) => setSelectedTask({...selectedTask, dueDate: e.target.value})}
                      className="w-full bg-[#0f111a] border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-violet-600 hover:bg-violet-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors cursor-pointer"
                  >
                    Save Changes
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

export default TasksKanban;
