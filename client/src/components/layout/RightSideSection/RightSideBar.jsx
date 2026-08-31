import React from 'react'
import TeamMember from './TeamMember';
import UpcomingEvents from './UpcomingEvents';
import TeamChat from './TeamChat';

export const RightSideBar = () => {
  return (
    <div className="w-full bg-[#111827] rounded-2xl p-2">
      <div className="flex flex-col gap-4">
        <TeamMember />
        <UpcomingEvents />
        <TeamChat />
      </div>
    </div>
  );
}

export default RightSideBar;