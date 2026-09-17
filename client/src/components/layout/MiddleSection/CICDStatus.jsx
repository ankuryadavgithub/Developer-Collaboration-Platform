import React, { useState, useEffect } from "react";
import Card from "../../common/Card";
import { ArrowRight, Loader2, CheckCircle2, XCircle, PlayCircle } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const timeAgo = (date) => {
  if (!date) return "";
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

const getStatusDetails = (status, conclusion) => {
  if (status === "queued" || status === "in_progress") {
    return { icon: <Loader2 className="animate-spin" size={16} />, color: "text-blue-400" };
  }
  if (conclusion === "success") {
    return { icon: <CheckCircle2 size={16} />, color: "text-green-400" };
  }
  if (conclusion === "failure") {
    return { icon: <XCircle size={16} />, color: "text-red-400" };
  }
  return { icon: <PlayCircle size={16} />, color: "text-slate-400" };
};

export const CICDStatus = () => {
  const { orgId, workspaceId } = useParams();
  const navigate = useNavigate();
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRuns = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/organizations/${orgId}/workspaces/${workspaceId}/github/actions/runs`,
          { withCredentials: true }
        );
        if (res.data.success) {
          // Take only the top 4 recent runs
          setRuns(res.data.data.slice(0, 4));
        }
      } catch (error) {
        console.error("Failed to fetch CI/CD runs", error);
      } finally {
        setLoading(false);
      }
    };
    if (orgId && workspaceId) {
      fetchRuns();
    }
  }, [orgId, workspaceId]);

  return (
    <Card className="h-full min-h-[320px] flex flex-col justify-between">
      <h3 className="text-lg font-semibold text-slate-100">CI/CD Status</h3>

      <div className="mt-4 flex-1 overflow-y-auto">
        {loading ? (
           <div className="flex justify-center items-center h-full text-slate-500">
             <Loader2 className="animate-spin" size={24} />
           </div>
        ) : runs.length === 0 ? (
           <div className="flex justify-center items-center h-full text-slate-500 text-sm">
             No CI/CD runs found.
           </div>
        ) : (
          runs.map((run) => {
            const { icon, color } = getStatusDetails(run.status, run.conclusion);
            return (
              <div
                key={run.id}
                className="flex items-center justify-between py-4 border-b border-slate-800 gap-2">
                <div className="flex flex-col min-w-0">
                  <span className="text-sm text-slate-300 truncate font-medium">{run.name}</span>
                  <span className="text-xs text-slate-500 truncate">{run.headBranch}</span>
                </div>

                <div
                  className={`flex items-center gap-1 text-sm font-medium shrink-0 ${color}`}
                >
                  {icon}
                  <span className="capitalize">{run.status === "completed" ? run.conclusion : run.status}</span>
                </div>

                <div className="text-xs text-slate-500 shrink-0 min-w-[50px] text-right">
                  {timeAgo(run.createdAt)}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="flex justify-center mt-4 shrink-0">
        <button 
          onClick={() => navigate(`/organizations/${orgId}/workspaces/${workspaceId}/ci-cd`)}
          className=" flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
        >
          View Pipelines
          <ArrowRight size={16} />
        </button>
      </div>
    </Card>
  );
};

export default CICDStatus;
