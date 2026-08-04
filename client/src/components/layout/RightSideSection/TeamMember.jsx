import React from "react";

export const teamMembers = [
  {
    id: 1,
    name: "Ankur Y. (You)",
    role: "Admin",
    status: "Online",
    statusColor: "bg-emerald-500",
    avatar: "https://i.pravatar.cc/150?u=1",
  },
  {
    id: 2,
    name: "Sarah J.",
    role: "Frontend Developer",
    status: "Online",
    statusColor: "bg-emerald-500",
    avatar: "https://i.pravatar.cc/150?u=2",
  },
  {
    id: 3,
    name: "Soham A.",
    role: "Backend Developer",
    status: "Online",
    statusColor: "bg-emerald-500",
    avatar: "https://i.pravatar.cc/150?u=3",
  },
  {
    id: 4,
    name: "Anas S.",
    role: "DevOps Engineer",
    status: "Away",
    statusColor: "bg-yellow-500",
    avatar: "https://i.pravatar.cc/150?u=4",
  },
  {
    id: 5,
    name: "Sumit S.",
    role: "QA Engineer",
    status: "Offline",
    statusColor: "bg-gray-500",
    avatar: "https://i.pravatar.cc/150?u=5",
  },
  {
    id: 6,
    name: "Maria K.",
    role: "UI/UX Designer",
    status: "Online",
    statusColor: "bg-emerald-500",
    avatar: "https://i.pravatar.cc/150?u=6",
  },
];

export default function TeamMember() {
  return (
    <div className="bg-[#161822] rounded-xl p-5 mb-4 border border-white/5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-sm">Team Members</h3>
        <a
          href="#"
          className="text-indigo-400 hover:text-indigo-300 text-xs hover:underline transition-colors"
        >
          View all
        </a>
      </div>

      <div className="flex flex-col space-y-4">
        {teamMembers.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <img
                src={member.avatar}
                alt={member.name}
                className="w-8 h-8 rounded-full border border-white/10"
              />
              <div>
                <p className="text-sm font-medium text-white group-hover:text-indigo-400 transition-colors">
                  {member.name}
                </p>
                <p className="text-xs text-[#8b92a5]">{member.role}</p>
              </div>
            </div>

            <div className="flex items-center space-x-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${member.statusColor}`}
              ></span>
              <span
                className={`text-xs ${
                  member.status === "Online"
                    ? "text-emerald-500"
                    : member.status === "Away"
                      ? "text-yellow-500"
                      : "text-gray-500"
                }`}
              >
                {member.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
