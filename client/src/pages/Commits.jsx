import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
// Fixed the imports here! Removed Github and UserCircle2
import {
  GitCommit,
  ExternalLink,
  RefreshCw,
  Clock,
  GitBranch,
  User,
} from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

const Commits = () => {
  const { orgId, workspaceId } = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [commits, setCommits] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBranches = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/organizations/${orgId}/workspaces/${workspaceId}/github/branches`,
        { withCredentials: true },
      );
      const { branches, defaultBranch } = res.data.data;
      setBranches(branches);
      if (branches.length > 0) setSelectedBranch(defaultBranch || branches[0]);
    } catch (err) {
      console.error("Could not load branches", err);
    }
  };

  const fetchCommits = async () => {
    if (!selectedBranch) return;
    try {
      setLoading(true);
      const res = await axios.get(
        `http://localhost:5000/api/organizations/${orgId}/workspaces/${workspaceId}/github/commits?branch=${selectedBranch}`,
        { withCredentials: true },
      );
      setCommits(res.data.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load commits.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, [workspaceId]);
  useEffect(() => {
    fetchCommits();
  }, [selectedBranch]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0c10]">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className="flex-1 p-4 md:p-8 w-full h-full overflow-y-auto overflow-x-hidden min-w-0 relative z-10">
        <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        <div className="max-w-5xl mx-auto mt-6 pb-12">
          <div className="bg-[#1c1f2e]/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6 sm:p-8 mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 shadow-2xl">
            <div className="flex gap-4 items-center">
              <div className="bg-blue-500/20 p-3 rounded-xl border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                {/* Changed to GitBranch */}
                <GitBranch size={28} className="text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1">
                  Commit History
                </h1>
                <p className="text-slate-400 text-sm font-medium">
                  Track your team's latest code changes.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              <div className="relative w-full sm:w-56 group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <GitBranch
                    size={16}
                    className="text-slate-400 group-hover:text-blue-400 transition-colors"
                  />
                </div>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="bg-[#0f111a]/80 border border-slate-700/80 text-slate-200 rounded-xl pl-10 pr-10 py-2.5 w-full appearance-none outline-none focus:border-blue-500 hover:border-slate-500 transition-all cursor-pointer font-medium shadow-inner"
                >
                  {branches.map((branch) => (
                    <option
                      key={branch}
                      value={branch}
                      className="bg-[#1c1f2e]"
                    >
                      {branch}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </div>
              </div>

              <button
                onClick={fetchCommits}
                disabled={loading}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 px-5 rounded-xl flex items-center justify-center gap-2 border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] transition-all disabled:opacity-50"
              >
                <RefreshCw
                  size={18}
                  className={loading ? "animate-spin" : ""}
                />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          <div className="px-2 sm:px-6">
            {loading ? (
              <div className="flex flex-col justify-center items-center h-64 text-slate-400 gap-4">
                <RefreshCw size={32} className="animate-spin text-blue-500" />
                <span className="font-medium animate-pulse">
                  Syncing with GitHub...
                </span>
              </div>
            ) : error ? (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl text-center flex flex-col items-center gap-2">
                <div className="bg-red-500/20 p-3 rounded-full">
                  <GitCommit size={24} />
                </div>
                <span className="font-semibold">{error}</span>
              </div>
            ) : commits.length === 0 ? (
              <div className="bg-[#1c1f2e]/50 border border-white/5 text-slate-400 rounded-2xl h-64 flex flex-col items-center justify-center gap-3">
                <GitBranch size={48} className="text-slate-600" />
                <span className="font-medium text-lg">
                  No commits found on '{selectedBranch}'
                </span>
              </div>
            ) : (
              <div className="relative border-l-2 border-slate-800/80 ml-4 md:ml-8 space-y-8 pb-8">
                {commits.map((commit, index) => (
                  <div
                    key={commit.sha}
                    className="relative pl-8 md:pl-12 group"
                  >
                    <div className="absolute -left-[21px] top-4 bg-[#0a0c10] rounded-full w-10 h-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 z-10 p-1 border border-slate-700 group-hover:border-blue-500 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                      <img
                        src={commit.avatar}
                        alt={commit.author}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>

                    <div className="bg-[#1c1f2e]/40 backdrop-blur-sm p-5 rounded-2xl border border-white/5 hover:bg-[#1c1f2e]/80 hover:border-blue-500/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                      <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                        <div className="flex-1 min-w-0 w-full">
                          <a
                            href={commit.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-white font-semibold text-lg hover:text-blue-400 transition-colors block truncate mb-3"
                          >
                            {commit.message}
                          </a>

                          <div className="flex flex-wrap items-center gap-3 text-sm">
                            <span className="flex items-center gap-1.5 bg-slate-800/80 text-slate-300 px-3 py-1 rounded-full border border-slate-700/50">
                              {/* Changed to User */}
                              <User size={14} className="text-slate-400" />
                              {commit.author}
                            </span>
                            <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                              <Clock size={14} />
                              {new Date(commit.date).toLocaleString(undefined, {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>

                        <a
                          href={commit.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center lg:justify-start w-full lg:w-auto gap-2 font-mono text-sm bg-blue-500/10 text-blue-400 px-4 py-3 lg:py-2 rounded-xl hover:bg-blue-500 hover:text-white transition-all border border-blue-500/20 group/btn shrink-0 mt-4 lg:mt-0"
                        >
                          <GitCommit size={16} />
                          {commit.shortSha}
                          <ExternalLink
                            size={14}
                            className="opacity-50 group-hover/btn:opacity-100 transition-opacity"
                          />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Commits;
