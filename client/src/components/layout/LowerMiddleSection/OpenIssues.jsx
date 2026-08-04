import React from "react";
import Card from "../../common/Card";
import { CircleAlert, AlertTriangle, Info } from "lucide-react";

const openIssuesData = [
  {
    id: 218,
    title: "Login redirect issue",
    assignee: "Anas S.",
    priority: "Critical",
  },
  {
    id: 217,
    title: "Data sync failure",
    assignee: "Ankur Y.",
    priority: "High",
  },
  {
    id: 216,
    title: "UI alignment bug",
    assignee: "Sarah J.",
    priority: "High",
  },
  {
    id: 215,
    title: "API validation error",
    assignee: "Sumit S.",
    priority: "Medium",
  },
  {
    id: 214,
    title: "Improve loading speed",
    assignee: "Soham K.",
    priority: "Low",
  },
];

export const OpenIssues = () => {
  const getPriorityStyles = (priority) => {
    switch (priority) {
      case "Critical":
        return "bg-red-500/20 text-red-400";

      case "High":
        return "bg-orange-500/20 text-orange-400";

      case "Medium":
        return "bg-yellow-500/20 text-yellow-400";

      case "Low":
        return "bg-blue-500/20 text-blue-400";

      default:
        return "bg-slate-500/20 text-slate-400";
    }
  };

  const getIconStyles = (priority) => {
    switch (priority) {
      case "Critical":
        return "text-red-400";

      case "High":
        return "text-orange-400";

      case "Medium":
        return "text-yellow-400";

      case "Low":
        return "text-blue-400";

      default:
        return "text-slate-400";
    }
  };

  return (
    <Card className="h-full min-h-[320px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-100">Open Issues</h3>

        <button className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer">
          View All
        </button>
      </div>

      {/* Issues List */}
      <div>
        {openIssuesData.map((issue) => (
          <div
            key={issue.id}
            className="flex items-start justify-between py-1 border-b border-slate-800 last:border-none hover:bg-slate-800/20 px-2 rounded-lg transition-colors"
          >
            {/* Left */}
            <div className="flex gap-3 flex-1 min-w-0">
              <CircleAlert
                size={16}
                strokeWidth={1.75}
                className={`mt-1 flex-shrink-0 ${getIconStyles(
                  issue.priority,
                )}`}
              />

              <div className="min-w-0">
                <p className="text-xs text-slate-400">#{issue.id}</p>

                <h4 className="text-sm text-slate-100 truncate">
                  {issue.title}
                </h4>

                <p className="text-[10px] text-slate-400 mt-1">
                  {issue.assignee}
                </p>
              </div>
            </div>

            {/* Right */}
            <span
              className={`px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap ${getPriorityStyles(
                issue.priority,
              )}`}
            >
              {issue.priority}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default OpenIssues;