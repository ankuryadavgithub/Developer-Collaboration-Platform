import React from "react";
import Card from "../../common/Card";

const sprintData = {
  sprintNumber: 12,
  title: "Build Collaboration Core",
  dateRange: "May 1 - May 15, 2025",
  daysLeft: 14,
  progress: 82,

  storyPoints: {
    completed: 92,
    total: 112,
  },

  completedTasks: 23,
  inProgressTasks: 6,
  todoTasks: 11,
};

const StatItem = ({ label, value, className = "" }) => {
  return (
    <div className={className}>
      <p className="text-xs text-slate-400">{label}</p>

      <p className="mt-1 text-xl font-semibold text-slate-100 whitespace-nowrap">
        {value}
      </p>
    </div>
  );
};

export const CurrentSprint = () => {
  const {
    sprintNumber,
    title,
    dateRange,
    daysLeft,
    progress,
    storyPoints,
    completedTasks,
    inProgressTasks,
    todoTasks,
  } = sprintData;

  return (
    <Card className="h-full min-h-[320px] flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-100">Current Sprint</h3>

        <div className="px-3 py-1 text-xs rounded-lg border border-slate-700 bg-slate-800 text-slate-300">
          Sprint {sprintNumber}
        </div>
      </div>

      {/* Sprint Details */}
      <div className="mt-5">
        <h4 className="text-xl font-semibold text-white">
          Sprint {sprintNumber} - {title}
        </h4>

        <p className="mt-2 text-sm text-slate-400">
          {dateRange} ({daysLeft} days left)
        </p>
      </div>

      {/* Progress */}
      <div className="mt-5 flex items-center gap-3">
        <div className="flex-1 h-2.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-cyan-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <span className="text-xl font-semibold text-white">{progress}%</span>
      </div>

      {/* Stats */}
      <div className="mt-5 border-t border-slate-800 pt-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-3">
          <StatItem
            label="Story Points"
            value={
              <>
                {storyPoints.completed}
                <span className="text-slate-500">
                  {" / "}
                  {storyPoints.total}
                </span>
              </>
            }
          />

          <StatItem label="Completed" value={completedTasks}/>

          <StatItem
            label="In Progress"
            value={inProgressTasks}

          />

          <StatItem label="To Do" value={todoTasks} />
        </div>
      </div>
    </Card>
  );
};

export default CurrentSprint;
