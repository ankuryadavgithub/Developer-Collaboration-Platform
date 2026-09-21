import React from "react";
import { Calendar } from "lucide-react";

const upcomingEvents = [
  {
    id: 1,
    title: "Sprint Planning",
    date: "May 14, 2025 • 10:00 AM",
    color: "bg-purple-500/20",
    iconColor: "text-purple-500",
  },
  {
    id: 2,
    title: "Code Review Sync",
    date: "May 15, 2025 • 04:00 PM",
    color: "bg-indigo-500/20",
    iconColor: "text-indigo-500",
  },
  {
    id: 3,
    title: "Demo Day",
    date: "May 16, 2025 • 11:00 AM",
    color: "bg-blue-500/20",
    iconColor: "text-blue-500",
  },
];

export default function UpcomingEvents() {
  return (
    <div className="bg-[#161822] rounded-xl p-5 mb-4 border border-white/5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-sm">Upcoming Events</h3>
        <a
          href="#"
          className="text-indigo-400 hover:text-indigo-300 text-xs hover:underline transition-colors"
        >
          View calendar
        </a>
      </div>

      <div className="flex flex-col space-y-4">
        {upcomingEvents.map((event) => (
          <div
            key={event.id}
            className="flex items-center space-x-3 group cursor-pointer"
          >
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${event.color}`}
            >
              <Calendar className={`w-5 h-5 ${event.iconColor}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-white group-hover:text-indigo-400 transition-colors">
                {event.title}
              </p>
              <p className="text-xs text-[#8b92a5] mt-0.5">{event.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
