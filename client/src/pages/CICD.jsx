import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ExternalLink, RefreshCw, Clock, AlertCircle, PlayCircle, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "m ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m ago";
  return Math.floor(seconds) + "s ago";
};

const getStatusIcon = (status, conclusion) => {
  if (status === "queued" || status === "in_progress") {
    return <Loader2 className="animate-spin text-blue-400" size={18} />;
  }
  if (conclusion === "success") {
    return <CheckCircle2 className="text-green-400" size={18} />;
  }
  if (conclusion === "failure") {
    return <XCircle className="text-red-400" size={18} />;
  }
  return <PlayCircle className="text-slate-400" size={18} />;
};

const CICD = () => {
  const { orgId, workspaceId } = useParams();
  
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");

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

  const filteredRuns = runs.filter(run => {
    if (search && !run.name.toLowerCase().includes(search.toLowerCase()) && !run.triggerMessage.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-[#111827] to-indigo-950">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <main className="flex-1 p-4 w-full h-full overflow-y-auto min-w-0">
        <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <div className="max-w-[1200px] mx-auto mt-6 h-[calc(100vh-140px)] flex flex-col">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 shrink-0">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
                <PlayCircle size={32} className="text-indigo-400" /> 
                CI/CD Pipelines
              </h1>
              <p className="text-slate-400 mt-1">
                Recent GitHub Actions workflow runs
              </p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Search runs..."
                className="bg-[#1c1f2e] border border-slate-700 text-white px-4 py-2 rounded-lg outline-none focus:border-indigo-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                onClick={fetchRuns}
                disabled={loading}
                className="bg-slate-800 hover:bg-slate-700 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors border border-slate-700 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Refresh
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 bg-[#1c1f2e]/60 border border-[#ffffff]/10 rounded-xl overflow-hidden flex flex-col shadow-xl">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-[#ffffff]/10 text-xs font-bold text-slate-400 uppercase tracking-wider bg-[#0f111a]/50">
              <div className="col-span-4">Workflow</div>
              <div className="col-span-4">Trigger</div>
              <div className="col-span-2">Branch</div>
              <div className="col-span-2 text-right">Status</div>
            </div>

            {/* Table Body */}
            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                  <RefreshCw size={32} className="animate-spin mb-4 text-indigo-500" />
                  <p>Loading Pipeline Runs from GitHub...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-64 text-red-400 px-4 text-center">
                  <AlertCircle size={48} className="mb-4 opacity-50" />
                  <p className="text-lg font-semibold">{error}</p>
                </div>
              ) : filteredRuns.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                  <PlayCircle size={48} className="mb-4 opacity-20" />
                  <p className="text-lg font-medium text-slate-300 mb-1">No CI/CD runs found</p>
                  <p className="text-sm">Make sure GitHub Actions are configured for this repo.</p>
                </div>
              ) : (
                <div className="divide-y divide-[#ffffff]/5">
                  {filteredRuns.map((run) => (
                    <div key={run.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-[#252a3e] transition-colors group">
                      
                      {/* Workflow Info */}
                      <div className="col-span-4 flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                          {getStatusIcon(run.status, run.conclusion)}
                          <a 
                            href={run.url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-white font-semibold text-base hover:text-indigo-400 transition-colors line-clamp-1"
                          >
                            {run.name}
                          </a>
                          <a href={run.url} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ExternalLink size={14} />
                          </a>
                        </div>
                        <span className="text-xs text-slate-500 ml-6">
                           {timeAgo(run.createdAt)}
                        </span>
                      </div>

                      {/* Trigger Info */}
                      <div className="col-span-4 flex flex-col">
                        <span className="text-sm text-slate-300 truncate font-medium">
                          {run.triggerMessage}
                        </span>
                        <span className="text-xs text-slate-500">
                          by {run.triggerAuthor}
                        </span>
                      </div>

                      {/* Branch Info */}
                      <div className="col-span-2 flex items-center">
                        <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700 truncate max-w-[120px]">
                          {run.headBranch}
                        </span>
                      </div>

                      {/* Status */}
                      <div className="col-span-2 text-right flex flex-col items-end justify-center">
                         <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                          run.status === "in_progress" || run.status === "queued"
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                            : run.conclusion === "success"
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                        }`}>
                          {run.status === "completed" ? run.conclusion : run.status}
                        </span>
                      </div>
                      
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CICD;
