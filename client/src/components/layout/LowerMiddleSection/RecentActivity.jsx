import React from "react";
import Card from "../../common/Card";
import { MessageSquare, GitMerge, CircleDot, GitCommit, CheckCircle, PlusCircle, Play, CheckSquare } from "lucide-react";

const timeAgo = (dateStr) => {
  const diff = (new Date() - new Date(dateStr)) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return Math.floor(diff / 60) + "m ago";
  if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
  return Math.floor(diff / 86400) + "d ago";
};

const getActivityConfig = (type) => {
  switch(type) {
    case 'PROJECT_CREATED':
      return { icon: PlusCircle, bg: 'bg-emerald-500/20', color: 'text-emerald-400' };
    case 'TASK_CREATED':
      return { icon: CircleDot, bg: 'bg-blue-500/20', color: 'text-blue-400' };
    case 'TASK_UPDATED':
      return { icon: MessageSquare, bg: 'bg-orange-500/20', color: 'text-orange-400' };
    case 'TASK_COMPLETED':
      return { icon: CheckSquare, bg: 'bg-emerald-500/20', color: 'text-emerald-400' };
    case 'SPRINT_CREATED':
      return { icon: PlusCircle, bg: 'bg-purple-500/20', color: 'text-purple-400' };
    case 'SPRINT_STARTED':
      return { icon: Play, bg: 'bg-cyan-500/20', color: 'text-cyan-400' };
    case 'SPRINT_COMPLETED':
      return { icon: CheckCircle, bg: 'bg-green-500/20', color: 'text-green-400' };
    default:
      return { icon: CircleDot, bg: 'bg-slate-500/20', color: 'text-slate-400' };
  }
};

export const RecentActivity = ({ activities }) => {
  return (
    <Card className="h-full min-h-[320px] flex flex-col bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-100">
          Recent Activity
        </h3>
      </div>

      <div className="space-y-1 overflow-y-auto max-h-[260px] pr-2">
        {!activities || activities.length === 0 ? (
          <p className="text-sm text-slate-400 text-center mt-8">No recent activity.</p>
        ) : (
          activities.map((activity) => {
            const config = getActivityConfig(activity.type);
            const Icon = config.icon;
            
            return (
              <div
                key={activity.id}
                className="flex items-center gap-3 py-2 border-b border-slate-800 last:border-none hover:bg-slate-800/30 rounded-lg px-2 transition-colors cursor-pointer"
              >
                <div className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center ${config.bg}`}>
                  <Icon size={16} className={config.color} />
                </div>
                {activity.user?.avatar ? (
                  <img src={activity.user.avatar} alt="Avatar" className="w-7 h-7 shrink-0 rounded-full object-cover" />
                ) : (
                  <div className="w-7 h-7 shrink-0 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold uppercase">
                    {activity.user?.username?.charAt(0) || '?'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200">
                    <span className="font-medium text-white">{activity.user?.username}</span>{" "}
                    {activity.message.replace(`User ${activity.user?.username} `, "")}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">{timeAgo(activity.createdAt)}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};

export default RecentActivity;
