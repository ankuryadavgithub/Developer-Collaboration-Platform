import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import Card from "../../common/Card";
import { getCurrentSprint } from "../../../services/githubService.js";

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
  if (!date) {
    return "No due date";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

export const CurrentSprint = () => {
  const [sprint, setSprint] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSprint = async () => {
      try {
        const result = await getCurrentSprint();
        setSprint(result.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Could not load the current sprint."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadSprint();
  }, []);

  if (isLoading) {
    return (
      <Card className="flex min-h-[320px] items-center justify-center">
        <LoaderCircle size={28} className="animate-spin text-violet-400" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
        <h3 className="text-lg font-semibold text-slate-100">
          Current Sprint
        </h3>

        <p className="mt-3 text-sm text-slate-400">{error}</p>
      </Card>
    );
  }

  return (
    <Card className="flex min-h-[320px] h-full flex-col justify-between">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-100">
          Current Sprint
        </h3>

        <div className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1 text-xs text-slate-300">
          Sprint {sprint.sprintNumber}
        </div>
      </div>

      <div className="mt-5">
        <h4 className="text-xl font-semibold text-white">
          Sprint {sprint.sprintNumber} — {sprint.title}
        </h4>

        <p className="mt-2 text-sm text-slate-400">
          Due {formatDate(sprint.dueDate)}
          {sprint.daysLeft !== null && ` (${sprint.daysLeft} days left)`}
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
          <StatItem label="Total Items" value={sprint.totalItems} />
          <StatItem label="Completed" value={sprint.completedTasks} />
          <StatItem label="Open" value={sprint.todoTasks} />
          <StatItem
            label="Days Left"
            value={sprint.daysLeft ?? "—"}
          />
        </div>
      </div>
    </Card>
  );
};

export default CurrentSprint;