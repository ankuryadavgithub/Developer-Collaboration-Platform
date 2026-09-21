import React, { useState, useEffect } from "react";
import { ResponsiveContainer, LineChart, Line } from "recharts";
import axios from "axios";
import { Loader2, ShieldAlert, GitPullRequest, Activity, GitBranch, AlertCircle } from "lucide-react";

const chartData = [
  { value: 20 },
  { value: 35 },
  { value: 28 },
  { value: 45 },
  { value: 30 },
  { value: 55 },
  { value: 48 },
];

const HealthMetric = ({ title, value, type, progress, color, chartColor, icon: Icon, description }) => {
  return (
    <div className="px-5 py-5 bg-[#111827] min-w-0 flex flex-col justify-between group">
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-medium text-slate-400 flex items-center gap-2">
          {Icon && <Icon size={15} className="opacity-60 shrink-0" />}
          {title}
        </h4>
      </div>
      
      <p className="text-3xl font-bold text-white mb-1 tracking-tight">{value}</p>
      
      {description && (
        <p className="text-xs text-slate-500 mb-3">{description}</p>
      )}

      {type === "progress" ? (
        <div className="mt-auto">
          <div className="h-2 bg-[#1c1f2e] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${color}`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 mt-1">{progress}% success rate</p>
        </div>
      ) : (
        <div className="h-10 mt-auto opacity-70 group-hover:opacity-100 transition-opacity">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={chartColor}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

const RepositoryHealth = ({ orgId, workspaceId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(
        `http://localhost:5000/api/organizations/${orgId}/workspaces/${workspaceId}/github/health`,
        { withCredentials: true }
      );
      if (res.data.success) {
        setData(res.data.data);
      } else {
        // BUG FIX: handle success:false without throwing
        setError(res.data.message || "Failed to fetch health data.");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to fetch repository health data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orgId && workspaceId) fetchMetrics();
  }, [orgId, workspaceId]);

  if (loading) {
    return (
      <div className="w-full bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden min-h-[180px] flex items-center justify-center text-slate-400">
        <Loader2 className="animate-spin mr-2" size={18} /> Analyzing GitHub Repository...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="w-full bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden min-h-[180px] flex flex-col items-center justify-center text-red-400 p-6 text-center gap-2">
        <AlertCircle size={28} className="opacity-60" />
        <p className="text-sm">{error || "No data available."}</p>
        <button
          onClick={fetchMetrics}
          className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  const repositoryHealthData = [
    {
      title: "Build Reliability",
      value: data.buildReliability === "N/A" ? "N/A" : data.buildReliability,
      description: "CI/CD Pipeline Success Rate",
      type: "progress",
      progress: data.buildReliabilityVal || 0,
      color:
        data.buildReliabilityVal > 80
          ? "bg-green-500"
          : data.buildReliabilityVal > 50
          ? "bg-orange-500"
          : "bg-red-500",
      icon: Activity,
    },
    {
      title: "Security Alerts",
      value: data.securityAlerts.toString(),
      description: "Active Dependabot Vulnerabilities",
      type: "chart",
      chartColor: data.securityAlerts > 0 ? "#ef4444" : "#22c55e",
      icon: ShieldAlert,
    },
    {
      title: "Open Issues",
      value: data.openIssues.toString(),
      description: "Unresolved issues in repository",
      type: "chart",
      chartColor: "#3b82f6",
      icon: AlertCircle,
    },
    {
      title: "Stale PRs",
      value: data.stalePRs.toString(),
      description: "Pull Requests open > 14 days",
      type: "chart",
      chartColor: data.stalePRs > 0 ? "#f97316" : "#22c55e",
      icon: GitPullRequest,
    },
  ];

  return (
    <div className="w-full bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden relative">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-[#0f111a]/50">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <GitBranch size={20} className="text-indigo-400" />
            Repository Health
          </h3>
          <p className="text-xs text-slate-400 mt-1">Real-time native GitHub metrics — no setup required</p>
        </div>
        <button
          onClick={fetchMetrics}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1"
          title="Refresh"
        >
          <Activity size={14} /> Refresh
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-px bg-slate-800">
        {repositoryHealthData.map((item) => (
          <HealthMetric key={item.title} {...item} />
        ))}
      </div>
    </div>
  );
};

export default RepositoryHealth;
