import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  ExternalLink, RefreshCw, Clock, AlertCircle, PlayCircle, 
  CheckCircle2, XCircle, Loader2, GitBranch, GitCommit, 
  MoreHorizontal, ChevronLeft, ChevronRight, Activity, Zap, Percent
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

const timeAgo = (date) => {
  if (!date) return "--";
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "mo ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m ago";
  return Math.floor(seconds) + "s ago";
};

const formatDuration = (seconds) => {
  if (!seconds && seconds !== 0) return "--";
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
};

const getStatusBadge = (status, conclusion) => {
  if (status === "in_progress" || status === "queued") {
    return (
      <span className="inline-flex w-max items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
        <Loader2 size={14} className="animate-spin" /> Running
      </span>
    );
  }
  if (conclusion === "success") {
    return (
      <span className="inline-flex w-max items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
        <CheckCircle2 size={14} /> Success
      </span>
    );
  }
  if (conclusion === "failure") {
    return (
      <span className="inline-flex w-max items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
        <XCircle size={14} /> Failed
      </span>
    );
  }
  if (conclusion === "cancelled") {
    return (
      <span className="inline-flex w-max items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">
        <XCircle size={14} /> Cancelled
      </span>
    );
  }
  return (
    <span className="inline-flex w-max items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">
      <PlayCircle size={14} /> {status}
    </span>
  );
};

const CICD = () => {
  const { orgId, workspaceId } = useParams();
  
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [workflowFilter, setWorkflowFilter] = useState("All");
  const [branchFilter, setBranchFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchRuns = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(
        `http://localhost:5000/api/organizations/${orgId}/workspaces/${workspaceId}/github/actions/runs`,
        { withCredentials: true }
      );
      if (res.data.success) {
        setRuns(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch CI/CD runs", error);
      setError(error.response?.data?.message || "Failed to load CI/CD runs. Make sure your GitHub is connected and has GitHub Actions enabled.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRuns();
  }, [workspaceId]);

  // Derived Stats
  const totalRuns = runs.length;
  const successfulRuns = runs.filter(r => r.conclusion === "success").length;
  const failedRuns = runs.filter(r => r.conclusion === "failure").length;
  const successRate = totalRuns ? ((successfulRuns / totalRuns) * 100).toFixed(1) : "0.0";
  
  // Unique dropdown options
  const uniqueWorkflows = ["All", ...new Set(runs.map(r => r.name))];
  const uniqueBranches = ["All", ...new Set(runs.map(r => r.headBranch))];
  const uniqueStatuses = ["All", "success", "failure", "in_progress", "cancelled"];

  // Filtering
  const filteredRuns = runs.filter(run => {
    if (search && !run.name.toLowerCase().includes(search.toLowerCase()) && !run.triggerMessage.toLowerCase().includes(search.toLowerCase())) return false;
    if (workflowFilter !== "All" && run.name !== workflowFilter) return false;
    if (branchFilter !== "All" && run.headBranch !== branchFilter) return false;
    if (statusFilter !== "All") {
       if (statusFilter === "in_progress") {
         if (run.status !== "in_progress" && run.status !== "queued") return false;
       } else {
         if (run.conclusion !== statusFilter) return false;
       }
    }
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredRuns.length / itemsPerPage);
  const paginatedRuns = filteredRuns.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Donut Chart Data
  const donutData = [
    { name: "Success", value: successfulRuns, color: "#22c55e" },
    { name: "Failed", value: failedRuns, color: "#ef4444" },
    { name: "Cancelled", value: runs.filter(r => r.conclusion === "cancelled").length, color: "#64748b" },
    { name: "Running", value: runs.filter(r => r.status === "in_progress" || r.status === "queued").length, color: "#3b82f6" },
  ].filter(d => d.value > 0);

  // Average Duration
  const validDurations = runs.filter(r => r.durationSeconds > 0).map(r => r.durationSeconds);
  const avgDurationSecs = validDurations.length ? Math.floor(validDurations.reduce((a,b)=>a+b,0) / validDurations.length) : 0;
  
  const lastSuccessfulRun = runs.find(r => r.conclusion === "success");
  const latestRun = runs[0]; // Assuming they come sorted newest first

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-[#0f111a] to-[#0f111a]">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <main className="flex-1 p-4 md:p-6 w-full h-full overflow-y-auto min-w-0">
        <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <div className="max-w-[1400px] mx-auto mt-6 flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
                <div className="p-2 bg-indigo-500/20 rounded-lg">
                  <PlayCircle size={28} className="text-indigo-400" />
                </div>
                CI/CD Pipelines
              </h1>
              <p className="text-slate-400 mt-1 ml-14">
                Monitor your GitHub Actions workflows, builds and deployments
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search runs, workflows, or commits..."
                  className="bg-[#1c1f2e] border border-slate-700 text-sm text-white pl-10 pr-4 py-2 w-72 rounded-lg outline-none focus:border-indigo-500"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <svg className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <button
                onClick={fetchRuns}
                disabled={loading}
                className="bg-slate-800 hover:bg-slate-700 text-sm text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors border border-slate-700 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
              </button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#1c1f2e]/80 border border-slate-800 rounded-xl p-5 flex items-center justify-between hover:scale-[1.02] hover:border-slate-600 transition-all duration-300">
              <div>
                <p className="text-sm text-slate-400 font-medium mb-1">Total Runs</p>
                <p className="text-3xl font-bold text-white mb-2">{totalRuns}</p>
                <p className="text-xs text-green-400 flex items-center gap-1">↑ 12 this week</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center">
                <Activity size={24} className="text-indigo-400" />
              </div>
            </div>
            
            <div className="bg-[#1c1f2e]/80 border border-slate-800 rounded-xl p-5 flex items-center justify-between hover:scale-[1.02] hover:border-slate-600 transition-all duration-300">
              <div>
                <p className="text-sm text-slate-400 font-medium mb-1">Successful</p>
                <p className="text-3xl font-bold text-white mb-2">{successfulRuns}</p>
                <p className="text-xs text-slate-400">{successRate}% of runs</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 size={24} className="text-green-400" />
              </div>
            </div>

            <div className="bg-[#1c1f2e]/80 border border-slate-800 rounded-xl p-5 flex items-center justify-between hover:scale-[1.02] hover:border-slate-600 transition-all duration-300">
              <div>
                <p className="text-sm text-slate-400 font-medium mb-1">Failed</p>
                <p className="text-3xl font-bold text-white mb-2">{failedRuns}</p>
                <p className="text-xs text-red-400 flex items-center gap-1">↓ 3 this week</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                <XCircle size={24} className="text-red-400" />
              </div>
            </div>

            <div className="bg-[#1c1f2e]/80 border border-slate-800 rounded-xl p-5 flex items-center justify-between hover:scale-[1.02] hover:border-slate-600 transition-all duration-300">
              <div>
                <p className="text-sm text-slate-400 font-medium mb-1">Success Rate</p>
                <p className="text-3xl font-bold text-white mb-2">{successRate}%</p>
                <p className="text-xs text-slate-400">Last 30 days</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Percent size={24} className="text-blue-400" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Left Column: Recent Workflow Runs Table */}
            <div className="xl:col-span-2 bg-[#1c1f2e]/60 border border-[#ffffff]/10 rounded-xl flex flex-col shadow-xl">
              <div className="p-5 border-b border-[#ffffff]/10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-white">Recent Workflow Runs</h2>
                    <p className="text-sm text-slate-400">Latest GitHub Actions runs for this repository</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      className="bg-slate-800 border border-slate-700 text-xs text-white px-3 py-1.5 rounded-md outline-none cursor-pointer"
                      value={workflowFilter}
                      onChange={(e) => setWorkflowFilter(e.target.value)}
                    >
                      {uniqueWorkflows.map(wf => <option key={wf} value={wf}>{wf === "All" ? "All Workflows" : wf}</option>)}
                    </select>
                    <select
                      className="bg-slate-800 border border-slate-700 text-xs text-white px-3 py-1.5 rounded-md outline-none cursor-pointer"
                      value={branchFilter}
                      onChange={(e) => setBranchFilter(e.target.value)}
                    >
                      {uniqueBranches.map(b => <option key={b} value={b}>{b === "All" ? "All Branches" : b}</option>)}
                    </select>
                    <select
                      className="bg-slate-800 border border-slate-700 text-xs text-white px-3 py-1.5 rounded-md outline-none cursor-pointer"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      {uniqueStatuses.map(s => <option key={s} value={s}>{s === "All" ? "All Status" : s}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-[#ffffff]/10 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-[#0f111a]/50">
                <div className="col-span-4 lg:col-span-3">Workflow</div>
                <div className="hidden lg:block col-span-2">Trigger</div>
                <div className="col-span-2 lg:col-span-2">Branch</div>
                <div className="col-span-3 lg:col-span-2">Commit</div>
                <div className="hidden lg:block col-span-1">Duration</div>
                <div className="col-span-3 lg:col-span-2">Status</div>
              </div>

              {/* Table Body */}
              <div className="flex-1 min-h-[400px]">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 py-20">
                    <Loader2 size={32} className="animate-spin mb-4 text-indigo-500" />
                    <p>Loading runs from GitHub...</p>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center h-full text-red-400 py-20">
                    <AlertCircle size={40} className="mb-4 opacity-50" />
                    <p className="font-semibold">{error}</p>
                  </div>
                ) : paginatedRuns.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 py-20">
                    <PlayCircle size={40} className="mb-4 opacity-20" />
                    <p className="font-medium text-slate-300">No runs match your filters</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#ffffff]/5">
                    {paginatedRuns.map((run) => (
                      <div key={run.id} className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-[#252a3e]/50 transition-colors group">
                        
                        {/* Workflow */}
                        <div className="col-span-4 lg:col-span-3 flex items-start gap-3">
                          {run.conclusion === "success" ? <CheckCircle2 size={16} className="text-green-400 mt-0.5 shrink-0" /> :
                           run.conclusion === "failure" ? <XCircle size={16} className="text-red-400 mt-0.5 shrink-0" /> :
                           <PlayCircle size={16} className="text-blue-400 mt-0.5 shrink-0" />}
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-semibold text-slate-200 truncate">{run.name}</span>
                            <span className="text-[11px] text-slate-500 truncate">{run.path?.split('/').pop() || "workflow"}</span>
                          </div>
                        </div>

                        {/* Trigger */}
                        <div className="hidden lg:flex col-span-2 items-center gap-1.5 text-xs text-slate-300">
                          {run.event === "push" ? <GitCommit size={14} className="text-slate-500" /> : 
                           run.event === "pull_request" ? <GitBranch size={14} className="text-slate-500" /> : 
                           <Clock size={14} className="text-slate-500" />}
                          <span className="capitalize">{run.event || "Manual"}</span>
                        </div>

                        {/* Branch */}
                        <div className="col-span-2 lg:col-span-2 flex items-center">
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700 truncate max-w-full">
                            {run.headBranch}
                          </span>
                        </div>

                        {/* Commit */}
                        <div className="col-span-3 lg:col-span-2 flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-xs font-mono text-slate-300">{run.headSha?.substring(0, 7)}</span>
                            <a href={run.url} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-indigo-400">
                              <ExternalLink size={12} />
                            </a>
                          </div>
                          <span className="text-[11px] text-slate-500 truncate">{run.triggerMessage}</span>
                        </div>

                        {/* Duration */}
                        <div className="hidden lg:flex col-span-1 text-xs text-slate-300">
                          {formatDuration(run.durationSeconds)}
                        </div>

                        {/* Status */}
                        <div className="col-span-3 lg:col-span-2 flex justify-end lg:justify-start">
                          {getStatusBadge(run.status, run.conclusion)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pagination */}
              {!loading && filteredRuns.length > 0 && (
                <div className="p-4 border-t border-[#ffffff]/10 flex items-center justify-between text-sm text-slate-400">
                  <span>Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredRuns.length)} of {filteredRuns.length} runs</span>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-50"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    {/* Simplified page numbers for now */}
                    <span className="px-3 py-1 bg-indigo-500 text-white rounded">{currentPage}</span>
                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-50"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Analytics & Details */}
            <div className="xl:col-span-1 flex flex-col gap-6">
              
              {/* Pipeline Health */}
              <div className="bg-[#1c1f2e]/60 border border-slate-800 rounded-xl p-5 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white">Pipeline Health</h3>
                  <select className="bg-transparent text-xs text-slate-400 outline-none">
                    <option>Last 30 days</option>
                  </select>
                </div>

                <div className="flex items-center gap-6 mb-6">
                  <div className="w-32 h-32 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={donutData}
                          innerRadius={45}
                          outerRadius={60}
                          paddingAngle={2}
                          dataKey="value"
                          stroke="none"
                        >
                          {donutData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1c1f2e', border: '1px solid #334155' }}
                          itemStyle={{ color: '#fff' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-xl font-bold text-white">{totalRuns}</span>
                      <span className="text-[10px] text-slate-400">Total Runs</span>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    {donutData.map(d => (
                      <div key={d.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></div>
                          <span className="text-slate-300">{d.name}</span>
                        </div>
                        <span className="text-slate-400">{d.value} ({((d.value/totalRuns)*100).toFixed(1)}%)</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                  <div>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mb-1">
                      <Clock size={12} /> Average Duration
                    </p>
                    <p className="text-lg font-semibold text-white">{formatDuration(avgDurationSecs)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mb-1">
                      <CheckCircle2 size={12} /> Last Successful Run
                    </p>
                    <p className="text-lg font-semibold text-white">{lastSuccessfulRun ? timeAgo(lastSuccessfulRun.createdAt) : "--"}</p>
                  </div>
                </div>
              </div>

              {/* Latest Run Details */}
              <div className="bg-[#1c1f2e]/60 border border-slate-800 rounded-xl p-5 shadow-xl flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white">Latest Run Details</h3>
                  <a href={latestRun?.url} target="_blank" rel="noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300">View all →</a>
                </div>

                {latestRun ? (
                  <>
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-3">
                        {latestRun.conclusion === "success" ? <CheckCircle2 size={24} className="text-green-400" /> :
                         latestRun.conclusion === "failure" ? <XCircle size={24} className="text-red-400" /> :
                         <PlayCircle size={24} className="text-blue-400" />}
                        <div>
                          <h4 className="font-semibold text-white text-sm">{latestRun.name}</h4>
                          <p className="text-xs text-slate-400">#{latestRun.runNumber}</p>
                        </div>
                      </div>
                      <span className="text-xs text-slate-500">{timeAgo(latestRun.createdAt)}</span>
                    </div>

                    <div className="flex flex-col gap-4 text-sm flex-1">
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-slate-500">Status</span>
                        <div className="col-span-2">{getStatusBadge(latestRun.status, latestRun.conclusion)}</div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 items-center">
                        <span className="text-slate-500">Triggered by</span>
                        <div className="col-span-2 flex items-center gap-1.5 text-slate-300">
                          {latestRun.event === "push" ? <GitCommit size={14} /> : 
                           latestRun.event === "pull_request" ? <GitBranch size={14} /> : 
                           <Clock size={14} />} 
                          <span className="capitalize">{latestRun.event || "Manual"}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 items-center">
                        <span className="text-slate-500">Branch</span>
                        <div className="col-span-2 flex items-center gap-1.5 text-slate-300 font-mono">
                          <GitBranch size={14} /> {latestRun.headBranch}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-slate-500">Commit</span>
                        <div className="col-span-2 flex flex-col gap-0.5">
                          <div className="flex items-center gap-1 text-slate-300">
                            <GitCommit size={14} /> 
                            <a href={latestRun.url} className="font-mono hover:text-indigo-400">{latestRun.headSha?.substring(0, 7)}</a>
                          </div>
                          <span className="text-xs text-slate-500 truncate">{latestRun.triggerMessage}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 items-center">
                        <span className="text-slate-500">Duration</span>
                        <div className="col-span-2 flex items-center gap-1.5 text-slate-300">
                          <Clock size={14} /> {formatDuration(latestRun.durationSeconds)}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 items-center">
                        <span className="text-slate-500">Workflow file</span>
                        <div className="col-span-2 flex items-center gap-1.5 text-slate-300">
                          <Activity size={14} /> <span className="truncate">{latestRun.path}</span>
                        </div>
                      </div>
                    </div>

                    <a 
                      href={latestRun.url}
                      target="_blank" 
                      rel="noreferrer"
                      className="mt-6 w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg text-center transition-colors block"
                    >
                      View Full Run Details ↗
                    </a>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
                    No run details available
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CICD;
