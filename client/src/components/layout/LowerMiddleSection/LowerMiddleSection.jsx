import React from 'react'
import { RecentActivity } from './RecentActivity';
import { PullRequests } from './PullRequests';
import { OpenIssues } from './OpenIssues';

const LowerMiddleSection = () => {
  return (
    <div className="w-full bg-[#111827] rounded-2xl p-2">
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4 items-stretch">
        <RecentActivity />
        <PullRequests />
        <div className="lg:col-span-2 2xl:col-span-1 h-full">
        <OpenIssues />
        </div>
      </div>
    </div>
  );
}

export default LowerMiddleSection;