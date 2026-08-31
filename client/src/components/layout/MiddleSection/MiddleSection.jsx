import React from 'react'
import { CurrentSprint } from './CurrentSprint';
import { ProjectOverview } from './ProjectOverview';
import { CICDStatus } from './CICDStatus';

const MiddleSection = ({ currentSprint, projectOverview }) => {
  return (
    <div className="w-full bg-[#111827] rounded-2xl p-2">
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4 items-stretch">
        <CurrentSprint sprint={currentSprint} />
        <ProjectOverview projects={projectOverview} />
        <div className="lg:col-span-2 2xl:col-span-1 h-full">
        <CICDStatus />
        </div>
      </div>
    </div>
  );
}

export default MiddleSection;