import { useEffect, useState } from "react";
import { CircleAlert, LoaderCircle } from "lucide-react";
import Card from "../../common/Card";
import { getOpenIssues } from "../../../services/githubService.js";

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

export const OpenIssues = () => {
  const [issues, setIssues] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadIssues = async () => {
      try {
        const result = await getOpenIssues();
        setIssues(result.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Could not load open issues."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadIssues();
  }, []);

  return (
    <Card className="flex min-h-[320px] h-full flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-100">Open Issues</h3>

        <a
          href="https://github.com/ankuryadavgithub/Developer-Collaboration-Platform/issues"
          target="_blank"
          rel="noreferrer"
          className="cursor-pointer text-sm text-indigo-400 transition-colors hover:text-indigo-300"
        >
          View All
        </a>
      </div>

      {isLoading && (
        <div className="flex flex-1 items-center justify-center">
          <LoaderCircle size={24} className="animate-spin text-violet-400" />
        </div>
      )}

      {!isLoading && error && (
        <p className="mt-6 text-center text-sm text-red-400">{error}</p>
      )}

      {!isLoading && !error && issues.length === 0 && (
        <p className="mt-6 text-center text-sm text-slate-400">
          No open GitHub issues.
        </p>
      )}

      {!isLoading && !error && issues.length > 0 && (
        <div>
          {issues.map((issue) => (
            <a
              key={issue.id}
              href={issue.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-start justify-between rounded-lg border-b border-slate-800 px-2 py-1 transition-colors last:border-none hover:bg-slate-800/20"
            >
              <div className="flex min-w-0 flex-1 gap-3">
                <CircleAlert
                  size={16}
                  strokeWidth={1.75}
                  className={`mt-1 shrink-0 ${getIconStyles(
                    issue.priority
                  )}`}
                />

                <div className="min-w-0">
                  <p className="text-xs text-slate-400">#{issue.id}</p>

                  <h4 className="truncate text-sm text-slate-100">
                    {issue.title}
                  </h4>

                  <p className="mt-1 text-[10px] text-slate-400">
                    {issue.assignee}
                  </p>
                </div>
              </div>

              <span
                className={`whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium ${getPriorityStyles(
                  issue.priority
                )}`}
              >
                {issue.priority}
              </span>
            </a>
          ))}
        </div>
      )}
    </Card>
  );
};

export default OpenIssues;