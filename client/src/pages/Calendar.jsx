import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Search,
  X,
  GripVertical,
  ExternalLink,
  Copy,
  Check,
  Globe,
  User,
  Star,
  FileText,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

const TASK_TYPE_STYLES = {
  BUG: {
    bg: "bg-red-500/15 hover:bg-red-500/25 border-red-500/30 text-red-400",
    dot: "bg-red-400",
    label: "Bug",
    icon: AlertCircle,
  },
  FEATURE: {
    bg: "bg-blue-500/15 hover:bg-blue-500/25 border-blue-500/30 text-blue-400",
    dot: "bg-blue-400",
    label: "Feature",
    icon: CheckCircle2,
  },
  DOCUMENTATION: {
    bg: "bg-purple-500/15 hover:bg-purple-500/25 border-purple-500/30 text-purple-400",
    dot: "bg-purple-400",
    label: "Documentation",
    icon: FileText,
  },
  ENHANCEMENT: {
    bg: "bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/30 text-emerald-400",
    dot: "bg-emerald-400",
    label: "Enhancement",
    icon: Sparkles,
  },
};

const getTaskType = (task) => {
  const title = (task.title || "").toLowerCase();
  const desc = (task.description || "").toLowerCase();
  if (title.includes("bug") || title.includes("fix") || title.includes("error") || desc.includes("bug")) {
    return "BUG";
  }
  if (title.includes("doc") || title.includes("readme") || desc.includes("document")) {
    return "DOCUMENTATION";
  }
  if (title.includes("optimiz") || title.includes("improve") || title.includes("refactor")) {
    return "ENHANCEMENT";
  }
  return "FEATURE";
};

const CalendarPage = () => {
  const { orgId, workspaceId } = useParams();
  const navigate = useNavigate();

  // Date & View states
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("month"); // 'month' | 'week' | 'day'
  const [scopeView, setScopeView] = useState("workspace"); // 'workspace' | 'my'

  // Data states
  const [tasks, setTasks] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [hideCompleted, setHideCompleted] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("ALL");
  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedPriority, setSelectedPriority] = useState("ALL");
  const [backlogSearch, setBacklogSearch] = useState("");

  // Drawer & Modals
  const [isBacklogOpen, setIsBacklogOpen] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [createModalDate, setCreateModalDate] = useState(null);
  const [showCreateChoiceModal, setShowCreateChoiceModal] = useState(false);
  const [showTaskCreateModal, setShowTaskCreateModal] = useState(false);
  const [showSprintCreateModal, setShowSprintCreateModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [calendarToken, setCalendarToken] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  // Form states
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    projectId: "",
    priority: "MEDIUM",
    assigneeId: "",
    storyPoints: 0,
    dueDate: "",
  });

  const [newSprint, setNewSprint] = useState({
    name: "",
    goal: "",
    startDate: "",
    endDate: "",
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Fetch initial data
  useEffect(() => {
    fetchCurrentUser();
    fetchProjects();
    fetchMembers();
  }, [workspaceId]);

  useEffect(() => {
    fetchCalendarData();
  }, [workspaceId, hideCompleted, selectedProjectId, selectedPriority]);

  const fetchCurrentUser = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users/me", { withCredentials: true });
      if (res.data.success) {
        setCurrentUser(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch current user:", err);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/organizations/${orgId}/workspaces/${workspaceId}/projects`,
        { withCredentials: true }
      );
      if (res.data.success) setProjects(res.data.data);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/organizations/${orgId}/workspaces/${workspaceId}/members`,
        { withCredentials: true }
      );
      if (res.data.success) setMembers(res.data.data);
    } catch (err) {
      console.error("Failed to fetch members:", err);
    }
  };

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      const params = {
        hideCompleted: hideCompleted ? "true" : "false",
      };
      if (selectedProjectId !== "ALL") params.projectId = selectedProjectId;
      if (selectedPriority !== "ALL") params.priority = selectedPriority;

      const res = await axios.get(
        `http://localhost:5000/api/organizations/${orgId}/workspaces/${workspaceId}/calendar`,
        { params, withCredentials: true }
      );

      if (res.data.success) {
        setTasks(res.data.data.tasks || []);
        setSprints(res.data.data.sprints || []);
      }
    } catch (err) {
      console.error("Failed to fetch calendar data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCalendarToken = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/organizations/${orgId}/workspaces/${workspaceId}/calendar/token`,
        { withCredentials: true }
      );
      if (res.data.success) {
        setCalendarToken(res.data.token);
        setShowSyncModal(true);
      }
    } catch (err) {
      console.error("Failed to fetch calendar token:", err);
      alert("Failed to generate calendar subscription link.");
    }
  };

  // Month navigation helpers
  const handlePrev = () => {
    if (viewMode === "month") {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else if (viewMode === "week") {
      setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000));
    } else {
      setCurrentDate(new Date(currentDate.getTime() - 24 * 60 * 60 * 1000));
    }
  };

  const handleNext = () => {
    if (viewMode === "month") {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else if (viewMode === "week") {
      setCurrentDate(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000));
    } else {
      setCurrentDate(new Date(currentDate.getTime() + 24 * 60 * 60 * 1000));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Filter tasks based on "My View" and filters
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (scopeView === "my" && currentUser) {
        if (task.assigneeId !== currentUser.id) return false;
      }
      if (selectedType !== "ALL") {
        const type = getTaskType(task);
        if (type !== selectedType) return false;
      }
      return true;
    });
  }, [tasks, scopeView, currentUser, selectedType]);

  // Backlog tasks (no dueDate)
  const backlogTasks = useMemo(() => {
    return filteredTasks.filter((t) => {
      if (t.dueDate) return false;
      if (backlogSearch) {
        return (
          t.title.toLowerCase().includes(backlogSearch.toLowerCase()) ||
          (t.project?.name || "").toLowerCase().includes(backlogSearch.toLowerCase())
        );
      }
      return true;
    });
  }, [filteredTasks, backlogSearch]);

  // Calendar days generation
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    if (viewMode === "month") {
      const firstDayOfMonth = new Date(year, month, 1);
      const lastDayOfMonth = new Date(year, month + 1, 0);

      const days = [];
      const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday
      const prevMonthLastDay = new Date(year, month, 0).getDate();

      // Prev month filler
      for (let i = startDayOfWeek - 1; i >= 0; i--) {
        const d = new Date(year, month - 1, prevMonthLastDay - i);
        days.push({ date: d, isCurrentMonth: false });
      }

      // Current month
      for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
        const d = new Date(year, month, i);
        days.push({ date: d, isCurrentMonth: true });
      }

      // Next month filler to complete 35 or 42 grid slots
      const remainingSlots = 42 - days.length >= 7 ? 42 - days.length : 35 - days.length;
      for (let i = 1; i <= remainingSlots; i++) {
        const d = new Date(year, month + 1, i);
        days.push({ date: d, isCurrentMonth: false });
      }

      return days;
    } else if (viewMode === "week") {
      const curr = new Date(currentDate);
      const first = curr.getDate() - curr.getDay();
      const days = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(curr.getFullYear(), curr.getMonth(), first + i);
        days.push({ date: d, isCurrentMonth: d.getMonth() === month });
      }
      return days;
    } else {
      // Day view
      return [{ date: new Date(currentDate), isCurrentMonth: true }];
    }
  }, [currentDate, viewMode]);

  // Drag and Drop handling
  const handleDragStart = (e, task) => {
    e.dataTransfer.setData("application/json", JSON.stringify({ taskId: task.id }));
  };

  const handleDropOnDate = async (e, dateStr) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json"));
      if (!data?.taskId) return;

      const taskId = data.taskId;
      const targetDate = new Date(dateStr);
      // Set to middle of the day in UTC
      targetDate.setHours(12, 0, 0, 0);

      // Optimistic UI update
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, dueDate: targetDate.toISOString() } : t))
      );

      // Backend sync
      await axios.patch(
        `http://localhost:5000/api/organizations/${orgId}/workspaces/${workspaceId}/tasks/${taskId}`,
        { dueDate: targetDate.toISOString() },
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Failed to reschedule task:", err);
      fetchCalendarData();
    }
  };

  // Click-to-create handling
  const handleDayClick = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const dateStr = `${yyyy}-${mm}-${dd}`;

    setCreateModalDate(dateStr);
    setShowCreateChoiceModal(true);
  };

  const handleOpenTaskModal = () => {
    setShowCreateChoiceModal(false);
    setNewTask({
      title: "",
      description: "",
      projectId: projects[0]?.id || "",
      priority: "MEDIUM",
      assigneeId: "",
      storyPoints: 0,
      dueDate: createModalDate || "",
    });
    setShowTaskCreateModal(true);
  };

  const handleOpenSprintModal = () => {
    setShowCreateChoiceModal(false);
    setNewSprint({
      name: "",
      goal: "",
      startDate: createModalDate || "",
      endDate: "",
    });
    setShowSprintCreateModal(true);
  };

  const handleCreateTaskSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: newTask.title,
        description: newTask.description,
        projectId: parseInt(newTask.projectId),
        priority: newTask.priority,
        dueDate: newTask.dueDate ? new Date(newTask.dueDate).toISOString() : null,
        storyPoints: parseInt(newTask.storyPoints) || 0,
        assigneeId: newTask.assigneeId ? parseInt(newTask.assigneeId) : null,
      };

      const res = await axios.post(
        `http://localhost:5000/api/organizations/${orgId}/workspaces/${workspaceId}/tasks`,
        payload,
        { withCredentials: true }
      );

      if (res.data.success) {
        setShowTaskCreateModal(false);
        fetchCalendarData();
      }
    } catch (err) {
      console.error("Failed to create task:", err);
      alert(err.response?.data?.message || "Failed to create task.");
    }
  };

  const handleCreateSprintSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: newSprint.name,
        goal: newSprint.goal,
        startDate: newSprint.startDate ? new Date(newSprint.startDate).toISOString() : null,
        endDate: newSprint.endDate ? new Date(newSprint.endDate).toISOString() : null,
      };

      const res = await axios.post(
        `http://localhost:5000/api/organizations/${orgId}/workspaces/${workspaceId}/sprints`,
        payload,
        { withCredentials: true }
      );

      if (res.data.success) {
        setShowSprintCreateModal(false);
        fetchCalendarData();
      }
    } catch (err) {
      console.error("Failed to create sprint:", err);
      alert(err.response?.data?.message || "Failed to create sprint.");
    }
  };

  const handleCopyICalLink = () => {
    const webcalLink = `webcal://${window.location.hostname}:5000/api/calendar/${calendarToken}.ics`;
    navigator.clipboard.writeText(webcalLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const resetFilters = () => {
    setHideCompleted(false);
    setSelectedProjectId("ALL");
    setSelectedType("ALL");
    setSelectedPriority("ALL");
  };

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const formatMonthYear = (date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  return (
    <div className="flex min-h-screen bg-[#0b0d14] text-slate-100 antialiased font-sans">
      <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      <div className="flex flex-1 flex-col overflow-x-hidden min-w-0">
        <Navbar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1700px] w-full mx-auto flex flex-col gap-6">
          {/* HEADER SECTION */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 shrink-0">
                <CalendarIcon size={22} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                  Calendar
                </h1>
                <p className="text-xs md:text-sm text-slate-400 mt-0.5">
                  Plan deadlines, track sprints, and stay aligned with your team's work.
                </p>
              </div>
            </div>

            {/* SYNC CALENDAR BUTTON */}
            <div className="flex items-center gap-3">
              <button
                onClick={fetchCalendarToken}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
              >
                <Globe size={16} />
                Sync Calendar
              </button>
            </div>
          </div>

          {/* CONTROLS & FILTER TOOLBAR */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#121520] border border-white/5 rounded-2xl p-4 shadow-xl">
            {/* Left: Navigation */}
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-[#1c1f2e] border border-white/10 rounded-xl p-1">
                <button
                  onClick={handlePrev}
                  className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
                  title="Previous"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={handleToday}
                  className="px-3 py-1 text-xs font-semibold hover:bg-white/5 rounded-lg text-slate-300 hover:text-white transition cursor-pointer"
                >
                  Today
                </button>
                <button
                  onClick={handleNext}
                  className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
                  title="Next"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              <h2 className="text-lg md:text-xl font-bold text-white min-w-[180px]">
                {formatMonthYear(currentDate)}
              </h2>
            </div>

            {/* Center: View Modes & Personal/Workspace toggle */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Month / Week / Day */}
              <div className="flex items-center bg-[#1c1f2e] border border-white/10 rounded-xl p-1 text-xs font-semibold">
                <button
                  onClick={() => setViewMode("month")}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    viewMode === "month"
                      ? "bg-violet-600 text-white shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Month
                </button>
                <button
                  onClick={() => setViewMode("week")}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    viewMode === "week"
                      ? "bg-violet-600 text-white shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => setViewMode("day")}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    viewMode === "day"
                      ? "bg-violet-600 text-white shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Day
                </button>
              </div>

              {/* My View vs Workspace View */}
              <div className="flex items-center bg-[#1c1f2e] border border-white/10 rounded-xl p-1 text-xs font-semibold">
                <button
                  onClick={() => setScopeView("my")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    scopeView === "my"
                      ? "bg-blue-600 text-white shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <User size={14} />
                  My View
                </button>
                <button
                  onClick={() => setScopeView("workspace")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    scopeView === "workspace"
                      ? "bg-blue-600 text-white shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Layers size={14} />
                  Workspace View
                </button>
              </div>
            </div>

            {/* Right: Quick Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hideCompleted}
                  onChange={(e) => setHideCompleted(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-violet-600 focus:ring-0 cursor-pointer"
                />
                Hide Completed
              </label>

              {/* Projects Filter */}
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="bg-[#1c1f2e] border border-white/10 text-slate-300 text-xs rounded-xl px-2.5 py-1.5 outline-none cursor-pointer focus:border-violet-500"
              >
                <option value="ALL">All Projects</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              {/* Type Filter */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-[#1c1f2e] border border-white/10 text-slate-300 text-xs rounded-xl px-2.5 py-1.5 outline-none cursor-pointer focus:border-violet-500"
              >
                <option value="ALL">All Types</option>
                <option value="FEATURE">Features</option>
                <option value="BUG">Bugs</option>
                <option value="DOCUMENTATION">Docs</option>
                <option value="ENHANCEMENT">Enhancements</option>
              </select>

              {/* Reset */}
              <button
                onClick={resetFilters}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition cursor-pointer"
                title="Reset Filters"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>

          {/* MAIN CALENDAR LAYOUT (GRID + RIGHT BACKLOG DRAWER) */}
          <div className="flex flex-col xl:flex-row gap-6 items-start">
            {/* CALENDAR GRID */}
            <div className="flex-1 w-full bg-[#121520] border border-white/5 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
              {/* Day Headers */}
              <div className="grid grid-cols-7 border-b border-white/5 bg-[#171a29] text-center text-xs font-semibold text-slate-400 uppercase tracking-wider py-3">
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>

              {/* SPRINT BANNERS OVERVIEW (ACTIVE IN VISIBLE RANGE) */}
              {sprints.length > 0 && (
                <div className="bg-[#151826] px-4 py-2 border-b border-white/5 flex flex-wrap gap-2 items-center">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Clock size={12} className="text-violet-400" /> Sprints:
                  </span>
                  {sprints.map((sprint) => {
                    const start = sprint.startDate
                      ? new Date(sprint.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      : "Unset";
                    const end = sprint.endDate
                      ? new Date(sprint.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      : "Unset";
                    const isCompleted = sprint.status === "COMPLETED";

                    return (
                      <div
                        key={sprint.id}
                        className={`text-xs px-3 py-1 rounded-lg border flex items-center gap-2 font-medium ${
                          isCompleted
                            ? "bg-slate-800/60 border-slate-700 text-slate-400"
                            : "bg-violet-600/20 border-violet-500/40 text-violet-300"
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-violet-400" />
                        <span className="font-bold">{sprint.name}</span>
                        <span className="text-[10px] opacity-70">
                          ({start} – {end})
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Calendar Days Matrix */}
              <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-white/5">
                {calendarDays.map(({ date, isCurrentMonth }, idx) => {
                  const yyyy = date.getFullYear();
                  const mm = String(date.getMonth() + 1).padStart(2, "0");
                  const dd = String(date.getDate()).padStart(2, "0");
                  const dateStr = `${yyyy}-${mm}-${dd}`;

                  // Find tasks due on this date
                  const dayTasks = filteredTasks.filter((t) => {
                    if (!t.dueDate) return false;
                    const d = new Date(t.dueDate);
                    return (
                      d.getFullYear() === yyyy &&
                      d.getMonth() === date.getMonth() &&
                      d.getDate() === date.getDate()
                    );
                  });

                  // Check if any sprint starts or spans this date
                  const activeSprintsOnDay = sprints.filter((s) => {
                    if (!s.startDate || !s.endDate) return false;
                    const sStart = new Date(s.startDate);
                    const sEnd = new Date(s.endDate);
                    return date >= sStart && date <= sEnd;
                  });

                  return (
                    <div
                      key={idx}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleDropOnDate(e, dateStr)}
                      onClick={() => handleDayClick(date)}
                      className={`min-h-[120px] md:min-h-[140px] p-2 transition-all flex flex-col group relative cursor-pointer ${
                        isCurrentMonth ? "bg-[#121520] hover:bg-[#181c2b]" : "bg-[#0d0f17]/60 text-slate-600"
                      } ${isToday(date) ? "ring-1 ring-violet-500/40 bg-violet-950/10" : ""}`}
                    >
                      {/* Day Number Header */}
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full transition ${
                            isToday(date)
                              ? "bg-blue-600 text-white font-black shadow"
                              : isCurrentMonth
                              ? "text-slate-300"
                              : "text-slate-600"
                          }`}
                        >
                          {date.getDate()}
                        </span>

                        {/* Hover Quick Add Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDayClick(date);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded text-slate-300 transition"
                          title="Add task or sprint"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {/* Mini Sprint Ribbon if any */}
                      {activeSprintsOnDay.slice(0, 1).map((s) => (
                        <div
                          key={s.id}
                          className="text-[10px] px-1.5 py-0.5 mb-1 rounded bg-violet-500/10 border border-violet-500/20 text-violet-300 font-semibold truncate"
                          title={`Sprint: ${s.name}`}
                        >
                          {s.name}
                        </div>
                      ))}

                      {/* Tasks Pills for this day */}
                      <div className="flex flex-col gap-1.5 flex-1 overflow-y-auto max-h-[100px] custom-scrollbar">
                        {dayTasks.map((task) => {
                          const type = getTaskType(task);
                          const style = TASK_TYPE_STYLES[type] || TASK_TYPE_STYLES.FEATURE;
                          const Icon = style.icon;
                          const isDone = task.status === "DONE";

                          return (
                            <div
                              key={task.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, task)}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTask(task);
                              }}
                              className={`text-[11px] p-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-grab active:cursor-grabbing shadow-sm ${
                                isDone
                                  ? "bg-slate-800/40 border-slate-700/50 text-slate-500 line-through"
                                  : style.bg
                              }`}
                            >
                              <Icon size={12} className="shrink-0" />
                              <span className="truncate font-medium flex-1">{task.title}</span>
                              {task.project?.name && (
                                <span className="text-[9px] opacity-70 truncate max-w-[60px] hidden md:inline">
                                  {task.project.name}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* CALENDAR BOTTOM LEGEND */}
              <div className="p-4 bg-[#0f111a] border-t border-white/5 flex flex-wrap items-center gap-6 text-xs text-slate-400">
                <span className="font-bold text-slate-300">Legend:</span>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span>Feature</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span>Bug</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <span>Documentation</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Enhancement</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                  <span>Completed</span>
                </div>
              </div>
            </div>

            {/* RIGHT SIDEBAR: BACKLOG DRAWER & TASK DETAILS */}
            <div className="w-full xl:w-80 flex flex-col gap-4">
              {/* BACKLOG DRAWER (NO DUE DATE) */}
              <div className="bg-[#121520] border border-white/5 rounded-2xl p-4 shadow-xl flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-violet-400" />
                    <h3 className="text-sm font-bold text-white">Backlog</h3>
                    <span className="text-xs bg-slate-800 px-2 py-0.5 rounded-full text-slate-300 font-semibold">
                      {backlogTasks.length}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">Drag to schedule</span>
                </div>

                {/* Backlog Search */}
                <div className="relative mt-3 mb-2">
                  <Search size={14} className="absolute left-2.5 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search backlog..."
                    value={backlogSearch}
                    onChange={(e) => setBacklogSearch(e.target.value)}
                    className="w-full bg-[#1c1f2e] border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-violet-500"
                  />
                </div>

                {/* Backlog Task List */}
                <div className="flex flex-col gap-2 mt-2 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
                  {backlogTasks.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-500">
                      No unscheduled tasks found.
                    </div>
                  ) : (
                    backlogTasks.map((task) => {
                      const type = getTaskType(task);
                      const style = TASK_TYPE_STYLES[type] || TASK_TYPE_STYLES.FEATURE;
                      const Icon = style.icon;

                      return (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task)}
                          onClick={() => setSelectedTask(task)}
                          className={`p-2.5 rounded-xl border bg-[#181b29] hover:border-white/20 transition-all flex items-start gap-2 cursor-grab active:cursor-grabbing shadow ${
                            selectedTask?.id === task.id ? "ring-1 ring-violet-500 border-violet-500" : "border-white/5"
                          }`}
                        >
                          <GripVertical size={14} className="text-slate-600 shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${style.bg}`}
                              >
                                {type}
                              </span>
                              {task.project?.name && (
                                <span className="text-[10px] text-slate-400 truncate">
                                  {task.project.name}
                                </span>
                              )}
                            </div>
                            <h4 className="text-xs font-semibold text-white truncate leading-tight">
                              {task.title}
                            </h4>
                          </div>

                          {task.assignee && (
                            <img
                              src={
                                task.assignee.avatar ||
                                `https://ui-avatars.com/api/?name=${task.assignee.username}&background=6d28d9&color=fff`
                              }
                              alt={task.assignee.username}
                              title={task.assignee.username}
                              className="w-5 h-5 rounded-full border border-slate-700 shrink-0"
                            />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Quick Add Backlog Task */}
                <button
                  onClick={() => {
                    setCreateModalDate("");
                    handleOpenTaskModal();
                  }}
                  className="mt-3 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition cursor-pointer"
                >
                  <Plus size={14} /> Add new task
                </button>
              </div>

              {/* TASK DETAILS QUICK PREVIEW SIDEBAR */}
              {selectedTask && (
                <div className="bg-[#121520] border border-white/5 rounded-2xl p-4 shadow-xl flex flex-col gap-3 relative animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">Task Details</span>
                    </div>
                    <button
                      onClick={() => setSelectedTask(null)}
                      className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-white leading-tight">
                    {selectedTask.title}
                  </h3>

                  {selectedTask.description && (
                    <p className="text-xs text-slate-400 line-clamp-3 bg-white/5 p-2.5 rounded-xl">
                      {selectedTask.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="bg-[#1c1f2e] p-2 rounded-xl border border-white/5">
                      <span className="text-[10px] text-slate-500 block uppercase">Status</span>
                      <span className="font-semibold text-slate-200">{selectedTask.status}</span>
                    </div>
                    <div className="bg-[#1c1f2e] p-2 rounded-xl border border-white/5">
                      <span className="text-[10px] text-slate-500 block uppercase">Project</span>
                      <span className="font-semibold text-slate-200 truncate block">
                        {selectedTask.project?.name || "None"}
                      </span>
                    </div>
                    <div className="bg-[#1c1f2e] p-2 rounded-xl border border-white/5">
                      <span className="text-[10px] text-slate-500 block uppercase">Due Date</span>
                      <span className="font-semibold text-slate-200">
                        {selectedTask.dueDate
                          ? new Date(selectedTask.dueDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "No due date"}
                      </span>
                    </div>
                    <div className="bg-[#1c1f2e] p-2 rounded-xl border border-white/5">
                      <span className="text-[10px] text-slate-500 block uppercase">Assignee</span>
                      <span className="font-semibold text-slate-200 truncate block">
                        {selectedTask.assignee?.username || "Unassigned"}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/organizations/${orgId}/workspaces/${workspaceId}/tasks`)}
                    className="mt-2 w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    Open in Kanban Board <ExternalLink size={13} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* CLICK-TO-CREATE CHOICE MODAL */}
        {showCreateChoiceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-[#161926] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white">Create on {createModalDate}</h3>
                <button
                  onClick={() => setShowCreateChoiceModal(false)}
                  className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-xs text-slate-400 mb-6">What would you like to create for this date?</p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleOpenTaskModal}
                  className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-blue-500/30 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 transition cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                    <Plus size={20} />
                  </div>
                  <span className="text-xs font-bold text-white">Create Task</span>
                  <span className="text-[10px] text-slate-400 text-center">Due on this date</span>
                </button>

                <button
                  onClick={handleOpenSprintModal}
                  className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-violet-500/30 bg-violet-600/10 hover:bg-violet-600/20 text-violet-400 transition cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold">
                    <Clock size={20} />
                  </div>
                  <span className="text-xs font-bold text-white">Create Sprint</span>
                  <span className="text-[10px] text-slate-400 text-center">Starts on this date</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TASK CREATION MODAL */}
        {showTaskCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-[#161926] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Create New Task</h3>
                <button
                  onClick={() => setShowTaskCreateModal(false)}
                  className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateTaskSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Implement authentication middleware"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="w-full bg-[#1c1f2e] border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Task details and scope..."
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="w-full bg-[#1c1f2e] border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-violet-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Project *</label>
                    <select
                      required
                      value={newTask.projectId}
                      onChange={(e) => setNewTask({ ...newTask, projectId: e.target.value })}
                      className="w-full bg-[#1c1f2e] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white outline-none focus:border-violet-500 cursor-pointer"
                    >
                      <option value="" disabled>
                        Select Project
                      </option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Due Date</label>
                    <input
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                      className="w-full bg-[#1c1f2e] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none focus:border-violet-500 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Assignee</label>
                    <select
                      value={newTask.assigneeId}
                      onChange={(e) => setNewTask({ ...newTask, assigneeId: e.target.value })}
                      className="w-full bg-[#1c1f2e] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white outline-none focus:border-violet-500 cursor-pointer"
                    >
                      <option value="">Unassigned</option>
                      {members.map((m) => (
                        <option key={m.user.id} value={m.user.id}>
                          {m.user.username}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Priority</label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                      className="w-full bg-[#1c1f2e] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white outline-none focus:border-violet-500 cursor-pointer"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-2 pt-3 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setShowTaskCreateModal(false)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow cursor-pointer"
                  >
                    Create Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* SPRINT CREATION MODAL */}
        {showSprintCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-[#161926] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Create New Sprint</h3>
                <button
                  onClick={() => setShowSprintCreateModal(false)}
                  className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateSprintSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Sprint Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sprint 14 - API Hardening"
                    value={newSprint.name}
                    onChange={(e) => setNewSprint({ ...newSprint, name: e.target.value })}
                    className="w-full bg-[#1c1f2e] border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Goal</label>
                  <textarea
                    rows={2}
                    placeholder="Sprint goals and objectives..."
                    value={newSprint.goal}
                    onChange={(e) => setNewSprint({ ...newSprint, goal: e.target.value })}
                    className="w-full bg-[#1c1f2e] border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-violet-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Start Date *</label>
                    <input
                      type="date"
                      required
                      value={newSprint.startDate}
                      onChange={(e) => setNewSprint({ ...newSprint, startDate: e.target.value })}
                      className="w-full bg-[#1c1f2e] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none focus:border-violet-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">End Date *</label>
                    <input
                      type="date"
                      required
                      value={newSprint.endDate}
                      onChange={(e) => setNewSprint({ ...newSprint, endDate: e.target.value })}
                      className="w-full bg-[#1c1f2e] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none focus:border-violet-500 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-2 pt-3 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setShowSprintCreateModal(false)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold shadow cursor-pointer"
                  >
                    Create Sprint
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* SYNC CALENDAR (iCal) MODAL */}
        {showSyncModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-[#161926] border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-blue-400">
                  <Globe size={20} />
                  <h3 className="text-lg font-bold text-white">Sync with External Calendar</h3>
                </div>
                <button
                  onClick={() => setShowSyncModal(false)}
                  className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-xs text-slate-400 mb-5">
                Subscribe to your assigned tasks in Google Calendar, Apple Calendar, or Microsoft Outlook. Tasks will stay updated in real time!
              </p>

              {/* Feed Link Box */}
              <div className="bg-[#0f111a] border border-white/10 rounded-xl p-3 flex items-center justify-between gap-3 mb-5">
                <code className="text-xs text-slate-300 font-mono truncate select-all">
                  webcal://localhost:5000/api/calendar/{calendarToken}.ics
                </code>
                <button
                  onClick={handleCopyICalLink}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shrink-0 transition cursor-pointer shadow"
                >
                  {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                  {copiedLink ? "Copied!" : "Copy Link"}
                </button>
              </div>

              {/* Instructions */}
              <div className="space-y-3 text-xs text-slate-400 bg-white/5 p-4 rounded-xl border border-white/5">
                <h4 className="font-bold text-slate-200">How to subscribe:</h4>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-blue-400">Google Calendar:</span>
                  <span>Settings &gt; Add calendar &gt; From URL &gt; Paste link &gt; Add calendar.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-emerald-400">Apple Calendar:</span>
                  <span>File &gt; New Calendar Subscription &gt; Paste link &gt; Subscribe.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-violet-400">Outlook:</span>
                  <span>Add Calendar &gt; Subscribe from web &gt; Paste link &gt; Import.</span>
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  onClick={() => setShowSyncModal(false)}
                  className="px-5 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarPage;
