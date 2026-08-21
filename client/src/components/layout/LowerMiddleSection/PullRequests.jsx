import { useEffect, useState } from "react";
import {
  GitPullRequest,
  LoaderCircle,
  MessageSquare,
} from "lucide-react";
import Card from "../../common/Card";
import axios from "axios";

const getStatusStyles = (status) => {
  switch (status) {
    case "Draft":
      return "bg-slate-500/20 text-slate-300";

    case "Review":
      return "bg-purple-500/20 text-purple-400";

    case "Open":
      return "bg-cyan-500/20 text-cyan-400";

    default:
      return "bg-slate-500/20 text-slate-400";
  }
};

export const PullRequests = ({ orgId, workspaceId }) => {
  const [pullRequests, setPullRequests] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPullRequests = async () => {
      try {
        const result = await axios.get(`http://localhost:5000/api/organizations/${orgId}/workspaces/${workspaceId}/github/pull-requests`, { withCredentials: true });
        setPullRequests(result.data.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Could not load pull requests."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadPullRequests();
  }, [orgId, workspaceId]);

  return (
    <Card className="flex min-h-[320px] h-full flex-col">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-100">
          Pull Requests
        </h3>
      </div>

      {isLoading && (
        <div className="flex flex-1 items-center justify-center">
          <LoaderCircle size={24} className="animate-spin text-violet-400" />
        </div>
      )}

      {!isLoading && error && (
        <p className="mt-6 text-center text-sm text-red-400">{error}</p>
      )}

      {!isLoading && !error && pullRequests.length === 0 && (
        <p className="mt-6 text-center text-sm text-slate-400">
          No open GitHub pull requests.
        </p>
      )}

      {!isLoading && !error && pullRequests.length > 0 && (
        <div>
          {pullRequests.map((pullRequest) => (
            <a
              key={pullRequest.id}
              href={pullRequest.url}
              target="_blank"
              rel="noreferrer"
              className="flex cursor-pointer items-start justify-between rounded-lg border-b border-slate-800 px-2 py-1 transition-colors last:border-none hover:bg-slate-800/20"
            >
              <div className="flex min-w-0 flex-1 gap-3">
                <GitPullRequest
                  size={18}
                  className="mt-1 shrink-0 text-slate-400"
                />

                <div className="min-w-0">
                  <p className="text-xs font-medium text-indigo-400">
                    #{pullRequest.id}
                  </p>

                  <h4 className="truncate text-sm text-slate-100">
                    {pullRequest.title}
                  </h4>

                  <p className="mt-1 text-[10px] text-slate-400">
                    by {pullRequest.author}
                  </p>
                </div>
              </div>

              <div className="ml-3 flex items-center gap-3">
                <span
                  className={`whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium ${getStatusStyles(
                    pullRequest.status
                  )}`}
                >
                  {pullRequest.status}
                </span>

                <div className="flex items-center gap-1 text-slate-400">
                  <MessageSquare size={14} />
                  <span className="text-xs">{pullRequest.comments}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </Card>
  );
};

export default PullRequests;