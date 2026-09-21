import React from "react";
import Card from "../../common/Card";
import { Link, useParams } from "react-router-dom";

export const ProjectOverview = ({ projects }) => {
  const { orgId, workspaceId } = useParams();

  if (!projects || projects.length === 0) {
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
    <Card className="h-full min-h-[320px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-100">
          Project Overview
        </h3>
        <Link to={`/organizations/${orgId}/workspaces/${workspaceId}/projects`} className="text-sm text-blue-400 hover:text-blue-300">View All</Link>
      </div>

      <div className="flex flex-col gap-4 overflow-y-auto pr-1">
        {projects.map(project => (
          <div key={project.id} className="bg-slate-800/30 p-3 rounded-xl border border-slate-700/50 hover:border-slate-600 transition-colors">
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-sm uppercase">
                {project.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-white truncate">{project.name}</h4>
                <div className="mt-1 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium w-6 text-right">{project.progress}%</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
