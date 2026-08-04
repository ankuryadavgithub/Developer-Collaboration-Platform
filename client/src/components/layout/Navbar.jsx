import { Search, Bell, Menu, MessageCircle } from 'lucide-react';
import React from 'react';
import githubIcon from "/src/assets/github.svg";

const Navbar = ({ toggleSidebar }) => {
  return (
    <div className="sticky top-0 z-40 flex items-center justify-between text-white px-4 md:px-8 py-2 border-b border-slate-800 bg-[#111827] rounded-2xl gap-2 md:gap-4">
      <div className="flex items-center gap-4 flex-shrink-0">
        <button
          className="md:hidden p-2 bg-[#1c1f2e] rounded-lg text-white hover:bg-[#2a2e45] transition-colors"
          onClick={toggleSidebar}
        >
          <Menu size={20} />
        </button>
        <div>
          <h2 className="text-[18px] font-semibold tracking-tight text-slate-100 hidden sm:block">
            Dashboard
          </h2>
          <p className="mt-1 text-[12px] text-slate-400 hidden lg:block">
            Welcome back, Ankur! Here's what's happening with your projects.
          </p>
        </div>
      </div>
      <div className="hidden sm:block flex-1 max-w-xl mx-2 md:mx-8">
        <search className="relative block group">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-violet-400"
          />

          <input
            type="text"
            placeholder="Search projects, repositories, files..."
            className="w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
          />
        </search>
      </div>
      <div className="flex items-center gap-3 md:gap-4 flex-shrink-0">
        <div className="relative">
          <Bell
            size={20}
            className="hidden md:block text-slate-400 cursor-pointer transition-transform hover:text-slate-200 hover:scale-110"
          />
          <span className="hidden md:block absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-[#111827]" />
        </div>

        <MessageCircle
          size={20}
          className="hidden md:block text-slate-400 cursor-pointer transition-transform hover:text-slate-200 hover:scale-110 duration-300"
        />

        <div className="h-5 w-5 flex items-center justify-center font-medium cursor-pointer transition-transform hover:scale-110 duration-300">
          <img
            src={githubIcon}
            alt="Google"
            className="invert opacity-70 hover:opacity-100 transition-opacity"
          />
        </div>
        <div className="h-9 w-9 rounded-full bg-violet-600 flex items-center justify-center font-medium hover:scale-110 cursor-pointer">
          A
        </div>
      </div>
    </div>
  );
}

export default Navbar