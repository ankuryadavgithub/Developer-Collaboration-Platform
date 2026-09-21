import { LoaderCircle } from "lucide-react";
import Card from "../../common/Card";

const StatItem = ({ label, value }) => {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 whitespace-nowrap text-xl font-semibold text-slate-100">
        {value}
      </p>
    </div>
  );
};

const formatDate = (date) => {
  if (!date) return "No due date";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

export const CurrentSprint = ({ sprint }) => {
  if (!sprint) {
    return (
      <Card className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
        <h3 className="text-lg font-semibold text-slate-100">
          Current Sprint
        </h3>
        <p className="mt-3 text-sm text-slate-400">No active sprint. Start a sprint from the Sprints page.</p>
      </Card>
    );
  }

  // Calculate days left
  const daysLeft = sprint.endDate
    ? Math.max(0, Math.ceil((new Date(sprint.endDate) - new Date()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <Card className="flex min-h-[320px] h-full flex-col justify-between">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-100">
          Current Sprint
        </h3>
        <div className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1 text-xs text-slate-300">
          {sprint.name}
        </div>
      </div>

      <div className="mt-5">
        <h4 className="text-xl font-semibold text-white">
          {sprint.goal || "No goal specified"}
        </h4>
        <p className="mt-2 text-sm text-slate-400">
          Due {formatDate(sprint.endDate)}
          {daysLeft !== null && ` (${daysLeft} days left)`}
        </p>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-cyan-500 transition-all duration-500"
            style={{ width: `${sprint.progress}%` }}
          />
        </div>
        <span className="text-xl font-semibold text-white">
          {sprint.progress}%
        </span>
      </div>

      <div className="mt-5 border-t border-slate-800 pt-5">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-3">
          <StatItem label="Total Points" value={sprint.totalStoryPoints} />
          <StatItem label="Completed" value={sprint.stats.completed} />
          <StatItem label="In Progress" value={sprint.stats.inProgress} />
          <StatItem label="Todo" value={sprint.stats.todo} />
        </div>
      </div>
    </Card>
  );
};

export default CurrentSprint;