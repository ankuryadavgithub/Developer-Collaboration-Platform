import React from "react";
import Card from "../../common/Card";

const ProjectData = {
  projectName: "Developer Collaboration Platform",
  projectDescription: "A unified platform to streamline teamwork for developers.",
  progress: 72,
  projectMembers: [
    "A", "B" , "C" , "D",
  ],
  extraProjectMembers:3,
  repositoryBranch: "main",

}
export const ProjectOverview = () => {
  const {
    projectName,
    projectDescription,
    progress,
    projectMembers,
    extraProjectMembers,
    repositoryBranch
  } = ProjectData;

  return (
    <Card className="h-full min-h-[320px] flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-100">
          Project Overview
        </h3>
      </div>
      <div className="mt-5 flex gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold">
          D
        </div>
        <div>
          <h4 className="text-base font-semibold text-white">{projectName}</h4>
          <p className="mt-1 text-sm text-slate-400">{projectDescription}</p>
        </div>
      </div>
      <div className="mt-4">
        <p className="text-sm text-slate-400">Overall Progress</p>

        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1 h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>

          <span className="text-xl font-semibold text-white">{progress}%</span>
        </div>
        <div className="mt-4 grid grid-cols-2">
          <div>
            <p className="text-sm text-slate-400">Members</p>

            <div className="flex items-center mt-3">
              <div className="w-7 h-7 rounded-full bg-red-500 border-2 border-slate-900"></div>

              <div className="-ml-2 w-7 h-7 rounded-full bg-blue-500 border-2 border-slate-900"></div>

              <div className="-ml-2 w-7 h-7 rounded-full bg-green-500 border-2 border-slate-900"></div>

              <div className="-ml-2 w-7 h-7 rounded-full bg-yellow-500 border-2 border-slate-900"></div>

              <div className="-ml-2 w-7 h-7 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center text-xs text-white">
                +{extraProjectMembers}
              </div>
            </div>
          </div>
          <div>
            <p className="text-sm text-slate-400">Repository</p>

            <div className="flex items-center gap-2 mt-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                className="text-slate-400"
              >
                <path d="M6 3v12" />
                <circle cx="18" cy="6" r="3" />
                <circle cx="6" cy="18" r="3" />
                <path d="M18 9a9 9 0 0 1-9 9" />
              </svg>

              <span className="text-white font-medium">{repositoryBranch}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
