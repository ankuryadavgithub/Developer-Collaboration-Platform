import React from "react";

const recentChats = [
  {
    id: 1,
    name: "Soham A.",
    time: "10:30 AM",
    message: "OAuth flow is ready for review.",
    avatar: "https://i.pravatar.cc/150?u=4",
  },
  {
    id: 2,
    name: "Ankur Y.",
    time: "10:28 AM",
    message: "Pushed the latest backend changes.",
    avatar: "https://i.pravatar.cc/150?u=3",
  },
  {
    id: 3,
    name: "Sumit S.",
    time: "10:25 AM",
    message: "Updated the UI for the dashboard.",
    avatar: "https://i.pravatar.cc/150?u=2",
  },
];

export default function TeamChat() {
  return (
    <div className="bg-[#161822] rounded-xl p-5 border border-white/5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-sm">
          Team Chat <span className="text-[#8b92a5] font-normal">(Recent)</span>
        </h3>
        <a
          href="#"
          className="text-indigo-400 hover:text-indigo-300 text-xs hover:underline transition-colors"
        >
          View all
        </a>
      </div>

      <div className="flex flex-col space-y-4">
        {recentChats.map((chat) => (
          <div key={chat.id} className="flex space-x-3 group cursor-pointer">
            <img
              src={chat.avatar}
              alt={chat.name}
              className="w-8 h-8 rounded-full border border-white/10 mt-0.5 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <p className="text-sm font-medium text-white group-hover:text-indigo-400 transition-colors truncate">
                  {chat.name}
                </p>
                <p className="text-xs text-[#8b92a5] whitespace-nowrap ml-2">
                  {chat.time}
                </p>
              </div>
              <p className="text-xs text-[#8b92a5] truncate">{chat.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
