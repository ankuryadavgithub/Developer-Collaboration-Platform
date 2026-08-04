import React from "react";
import Card from "../../common/Card";
import { MessageSquare, GitPullRequest } from "lucide-react";

const pullRequestsData = [
  {
    id: 144,
    title: "Add OAuth authentication",
    author: "Anas S.",
    status: "Review",
    comments: 3,
  },
  {
    id: 142,
    title: "Improve dashboard UI",
    author: "Sarah J.",
    status: "Approved",
    comments: 2,
  },
  {
    id: 141,
    title: "Fix API rate limit issue",
    author: "Ankur Y.",
    status: "Changes Requested",
    comments: 4,
  },
  {
    id: 140,
    title: "Update dependencies",
    author: "Sumit S.",
    status: "Review",
    comments: 1,
  },
  {
    id: 139,
    title: "Add unit tests for utils",
    author: "Soham K.",
    status: "Approved",
    comments: 2,
  },
];

const getStatusStyles = (status) => {
  switch (status) {
    case "Approved":
      return "bg-green-500/20 text-green-400";

    case "Review":
      return "bg-purple-500/20 text-purple-400";

    case "Changes Requested":
      return "bg-blue-500/20 text-blue-400";

    default:
      return "bg-slate-500/20 text-slate-400";
  }
};

export const PullRequests = () => {
  const getStatusStyles = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-500/20 text-green-400";

      case "Review":
        return "bg-purple-500/20 text-purple-400";

      case "Changes Requested":
        return "bg-blue-500/20 text-blue-400";

      default:
        return "bg-slate-500/20 text-slate-400";
    }
  };

  return (
    <Card className="h-full min-h-[320px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-slate-100">Pull Requests</h3>

        <button className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer">
          View All
        </button>
      </div>

      {/* PR List */}
      <div>
        {pullRequestsData.map((pr) => (
          <div
            key={pr.id}
            className="flex items-start justify-between py-1 border-b border-slate-800 last:border-none hover:bg-slate-800/20 px-2 rounded-lg transition-colors cursor-pointer"
          >
            {/* Left */}
            <div className="flex gap-3 flex-1 min-w-0">
              <GitPullRequest
                size={18}
                className="text-slate-400 mt-1 flex-shrink-0"
              />

              <div className="min-w-0">
                <p className="text-xs text-indigo-400 font-medium">
                  #{pr.id}
                </p>

                <h4 className="text-sm text-slate-100 truncate">
                  {pr.title}
                </h4>

                <p className="text-[10px] text-slate-400 mt-1">by {pr.author}</p>
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3 ml-3">
              <span
                className={`px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap ${getStatusStyles(
                  pr.status,
                )}`}
              >
                {pr.status}
              </span>

              <div className="flex items-center gap-1 text-slate-400">
                <MessageSquare size={14} />
                <span className="text-xs">{pr.comments}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default PullRequests;