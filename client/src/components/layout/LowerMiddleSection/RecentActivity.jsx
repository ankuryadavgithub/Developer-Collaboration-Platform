import React from "react";
import Card from "../../common/Card";
import {MessageSquare, GitMerge, CircleDot, GitCommit, CheckCircle } from "lucide-react";

const recentActivityStats = [
  {
    id: 1,
    user: "Sarah J.",
    action: "commented on PR #142",
    time: "3 minutes ago",
    icon: MessageSquare,
    iconBg: "bg-emerald-500/20",
    iconColor: "text-emerald-400",
    avatar: "https://i.pravatar.cc/100?img=5",
  },
  {
    id: 2,
    user: "Ankur Y.",
    action: "merged commit a3f5d2e into main",
    time: "25 minutes ago",
    icon: GitMerge,
    iconBg: "bg-violet-500/20",
    iconColor: "text-violet-400",
    avatar: "https://i.pravatar.cc/100?img=12",
  },
  {
    id: 3,
    user: "Anas S.",
    action: "created issue #218",
    time: "1 hour ago",
    icon: CircleDot,
    iconBg: "bg-red-500/20",
    iconColor: "text-red-400",
    avatar: "https://i.pravatar.cc/100?img=15",
  },
  {
    id: 4,
    user: "Soham A.",
    action: "pushed 3 commits to feature/auth",
    time: "2 hours ago",
    icon: GitCommit,
    iconBg: "bg-cyan-500/20",
    iconColor: "text-cyan-400",
    avatar: "https://i.pravatar.cc/100?img=20",
  },
  {
    id: 5,
    user: "Sumit S.",
    action: "closed issue #215",
    time: "3 hours ago",
    icon: CheckCircle,
    iconBg: "bg-rose-500/20",
    iconColor: "text-rose-400",
    avatar: "https://i.pravatar.cc/100?img=25",
  },
];

export const RecentActivity = () => {
  return (
    <Card className="h-full min-h-[320px] flex flex-col bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-100">
          Recent Activity
        </h3>

        <button className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer">
          View All
        </button>
      </div>

      {/* Activity List */}
      <div className="space-y-1">
        {recentActivityStats.map((activity) => {
          const Icon = activity.icon;

          return (
            <div
              key={activity.id}
              className="flex items-center gap-3 py-1 border-b border-slate-800 last:border-none hover:bg-slate-800/30 rounded-lg px-1 transition-colors cursor-pointer"
            >
              {/* Activity Icon */}
              <div
                className={`w-7 h-7 shrink-0 rounded-lg flex items-center justify-center ${activity.iconBg}`}
              >
                <Icon size={16} className={activity.iconColor} />
              </div>

              {/* Avatar */}
              <img
                src={activity.avatar}
                alt={activity.user}
                className="w-7 h-7 shrink-0 rounded-full object-cover"
              />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-200 truncate">
                  <span className="font-medium">{activity.user}</span>{" "}
                  {activity.action}
                </p>

                <p className="text-xs text-slate-400 mt-1">{activity.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default RecentActivity;
