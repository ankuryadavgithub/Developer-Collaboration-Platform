import React from "react";
import Card from "../../common/Card";
import { Link, useParams } from "react-router-dom";

export const ProjectOverview = ({ projects }) => {
  const { orgId, workspaceId } = useParams();
  const activeProject = projects && projects.length > 0 ? projects[0] : null;

  if (!activeProject) {
    return (
      <Card className="h-full min-h-[320px] flex flex-col items-center justify-center text-center">
        <h3 className="text-lg font-semibold text-slate-100 mb-2">Project Overview</h3>
        <p className="text-sm text-slate-400">No active projects yet.</p>
        <Link 
          to={`/organizations/${orgId}/workspaces/${workspaceId}/projects`}
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
        >
          Create Project
        </Link>
      </Card>
    );
  }

  return (
    <Card className="h-full min-h-[320px] flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-100">
          Project Overview
        </h3>
        <Link to={`/organizations/${orgId}/workspaces/${workspaceId}/projects`} className="text-sm text-blue-400 hover:text-blue-300">View All</Link>
      </div>
      <div className="mt-5 flex gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold text-lg uppercase shadow-lg shadow-purple-500/20">
          {activeProject.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-semibold text-white truncate">{activeProject.name}</h4>
          <p className="mt-1 text-sm text-slate-400 line-clamp-2">{activeProject.description || "No description provided."}</p>
        </div>
      </div>
      <div className="mt-6">
        <p className="text-sm text-slate-400 flex justify-between">
          <span>Overall Progress</span>
          <span className="text-white font-medium">{activeProject.progress}%</span>
        </p>

        <div className="mt-2 flex items-center gap-3">
          <div className="flex-1 h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-500 rounded-full transition-all duration-500"
              style={{ width: `${activeProject.progress}%` }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};
