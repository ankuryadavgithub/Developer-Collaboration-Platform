import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { GitPullRequest, ExternalLink, RefreshCw, MessageSquare, Clock, Filter, AlertCircle } from "lucide-react";
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

const PullRequests = () => {
  const { orgId, workspaceId } = useParams();
  const navigate = useNavigate();
  
  const [pullRequests, setPullRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const fetchPullRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(
        `http://localhost:5000/api/organizations/${orgId}/workspaces/${workspaceId}/github/pull-requests`,
        { withCredentials: true }
      );
      if (res.data.success) {
        setPullRequests(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch PRs", error);
      setError(error.response?.data?.message || "Failed to load Pull Requests. Make sure your GitHub is connected.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPullRequests();
  }, [workspaceId]);

  const filteredPRs = pullRequests.filter(pr => {
    if (filter !== "All" && pr.status !== filter) return false;
    if (search && !pr.title.toLowerCase().includes(search.toLowerCase())) return false;
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
                <GitPullRequest size={32} className="text-blue-500" /> 
                Pull Requests
              </h1>
              <p className="text-slate-400 mt-1">
                All active pull requests from your linked repository
              </p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Search PRs..."
                className="bg-[#1c1f2e] border border-slate-700 text-white px-4 py-2 rounded-lg outline-none focus:border-blue-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                className="bg-[#1c1f2e] border border-slate-700 text-white px-4 py-2 rounded-lg outline-none cursor-pointer"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="All">All</option>
                <option value="Open">Open</option>
                <option value="Review">Review</option>
                <option value="Draft">Draft</option>
              </select>
              <button
                onClick={fetchPullRequests}
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
              <div className="col-span-6">Pull Request</div>
              <div className="col-span-2">Author</div>
              <div className="col-span-2">State</div>
              <div className="col-span-2 text-right">Updated</div>
            </div>

            {/* Table Body */}
            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                  <RefreshCw size={32} className="animate-spin mb-4 text-blue-500" />
                  <p>Loading Pull Requests from GitHub...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-64 text-red-400">
                  <AlertCircle size={48} className="mb-4 opacity-50" />
                  <p className="text-lg font-semibold">{error}</p>
                </div>
              ) : filteredPRs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                  <GitPullRequest size={48} className="mb-4 opacity-20" />
                  <p className="text-lg font-medium text-slate-300 mb-1">No active Pull Requests found</p>
                  <p className="text-sm">You're all caught up!</p>
                </div>
              ) : (
                <div className="divide-y divide-[#ffffff]/5">
                  {filteredPRs.map((pr) => (
                    <div key={pr.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-[#252a3e] transition-colors group">
                      
                      {/* PR Info */}
                      <div className="col-span-6 flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                          <a 
                            href={pr.url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-white font-semibold text-base hover:text-blue-400 transition-colors line-clamp-1"
                          >
                            {pr.title}
                          </a>
                          <a href={pr.url} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ExternalLink size={14} />
                          </a>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="font-mono">#{pr.id}</span>
                          {pr.comments !== undefined && (
                            <span className="flex items-center gap-1">
                              <MessageSquare size={12} /> {pr.comments}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Author */}
                      <div className="col-span-2 flex items-center gap-2">
                        <img 
                          src={`https://github.com/${pr.author}.png?size=40`} 
                          alt={pr.author} 
                          className="w-7 h-7 rounded-full border border-slate-700"
                        />
                        <span className="text-sm text-slate-300 truncate font-medium">{pr.author}</span>
                      </div>

                      {/* State Badge */}
                      <div className="col-span-2 flex items-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                          pr.status === "Review" 
                            ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                            : pr.status === "Draft"
                            ? "bg-slate-500/10 text-slate-400 border-slate-500/20"
                            : "bg-green-500/10 text-green-400 border-green-500/20"
                        }`}>
                          {pr.status}
                        </span>
                      </div>

                      {/* Date */}
                      <div className="col-span-2 text-right flex flex-col items-end justify-center">
                        <span className="text-sm text-slate-400 flex items-center gap-1.5">
                          <Clock size={12} className="text-slate-500" />
                          {timeAgo(pr.updatedAt)}
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

export default PullRequests;
