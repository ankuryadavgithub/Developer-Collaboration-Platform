import { Book, BookAIcon, BookCheck, BookCopy, BookIcon, BookOpenText, BubblesIcon, Calendar, Calendar1Icon, ChartBar, CircleArrowDown, CircleCheck, Folder, GitBranchMinusIcon, GitCommit, GitCommitHorizontalIcon, GitCompare, GitMergeConflict, GitPullRequest, GitPullRequestArrow, HomeIcon, LucideGitCommit, LucideMirrorRectangular, MessageCircle, Settings, Ticket, User2, User2Icon, UserCircleIcon, UserIcon, UserRound, PanelLeftOpen, PanelLeftClose, LayoutDashboard, CircleUserRound, ShieldCheck} from "lucide-react";

import { useOrganization } from "../../context/OrganizationContext";
import {useState} from 'react'
import { useParams, useNavigate } from 'react-router-dom';

function Sidebar({ isOpen, setIsOpen }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { orgId, workspaceId } = useParams();
  const navigate = useNavigate();
  const { organizations, currentOrg, switchOrganization, loading } = useOrganization();
  
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

    return (
      <>
        {isOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
        <div
          className={`flex flex-col ${`isCollapsed ? "w-12":"w-[240px]"`} h-full bg-[#0f111a] text-[#8b92a5] border-r border-[#ffffff]/10 fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex items-center justify-between h-16 p-4 text-white font-bold">
            {!isCollapsed && <span className="whitespace nowrap">Devhub</span>}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-lg hover:bg-[#1c1f2e] text-slate-400 hover:text-white transition-colors"
            >
              {isCollapsed ? (
                <PanelLeftOpen size={20} className="cursor-pointer" />
              ) : (
                <PanelLeftClose size={20} className="cursor-pointer" />
              )}
            </button>
          </div>
          {/* Organization Switcher */}
          {!loading && organizations.length > 0 && (
            <div
              className={`px-4 pb-2 border-b border-[#ffffff]/10 mb-2 ${isCollapsed ? "hidden" : "block"}`}
            >
              <select
                className="w-full bg-[#1c1f2e] text-white text-sm font-semibold rounded-lg p-2 outline-none border border-slate-700 hover:border-slate-500 transition-colors cursor-pointer"
                value={currentOrg?.id || ""}
                onChange={(e) => switchOrganization(e.target.value)}
              >
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {workspaceId && (
            <div className="flex flex-col flex-1 overflow-y-auto px-4 gap-1 mt-2">
              <div
                onClick={() =>
                  navigate(
                    `/organizations/${orgId}/workspaces/${workspaceId}/dashboard`,
                  )
                }
                className="flex items-center h-10 px-3 gap-2 hover:bg-[#1c1f2e] hover:text-white rounded-lg font-medium cursor-pointer transition-colors"
              >
                <HomeIcon size={18} className="text-slate-300 shrink-0" />
                <span
                  className={`truncate transition-all duration-300 overflow-hidden ${isCollapsed ? "w-0 opacity-0" : "w-32 opacity-100"}`}
                >
                  Dashboard
                </span>
              </div>
              <div
                onClick={() =>
                  navigate(
                    `/organizations/${orgId}/workspaces/${workspaceId}/projects`,
                  )
                }
                className="flex items-center h-10 px-3 gap-2 hover:bg-[#1c1f2e] hover:text-white rounded-lg cursor-pointer transition-colors"
              >
                <Folder size={18} className="text-slate-300 shrink-0" />
                <span
                  className={`truncate transition-all duration-300 overflow-hidden ${isCollapsed ? "w-0 opacity-0" : "w-32 opacity-100"}`}
                >
                  Projects
                </span>
              </div>
              <div
                onClick={() =>
                  navigate(
                    `/organizations/${orgId}/workspaces/${workspaceId}/tasks`,
                  )
                }
                className="flex items-center h-10 px-3 gap-2 rounded-lg hover:bg-[#1c1f2e] hover:text-white cursor-pointer transition-colors"
              >
                <CircleCheck size={18} className="text-slate-300 shrink-0" />
                <span
                  className={`truncate transition-all duration-300 overflow-hidden ${isCollapsed ? "w-0 opacity-0" : "w-32 opacity-100"}`}
                >
                  Issues / Tasks
                </span>
              </div>
              <div
                onClick={() => navigate(`/organizations/${orgId}/workspaces/${workspaceId}/pull-requests`)}
                className="flex items-center h-10 px-3 gap-2 rounded-lg hover:bg-[#1c1f2e] hover:text-white cursor-pointer transition-colors"
              >
                <GitPullRequestArrow
                  size={18}
                  className="text-slate-300 shrink-0"
                />
                <span
                  className={`truncate transition-all duration-300 overflow-hidden ${isCollapsed ? "w-0 opacity-0" : "w-32 opacity-100"}`}
                >
                  Pull Requests
                </span>
              </div>
              <div
                onClick={() => alert("Coming Soon!")}
                className="flex items-center h-10 px-3 gap-2 rounded-lg hover:bg-[#1c1f2e] hover:text-white cursor-pointer transition-colors"
              >
                <GitCommitHorizontalIcon
                  size={18}
                  className="text-slate-300 shrink-0"
                />
                <span
                  className={`truncate transition-all duration-300 overflow-hidden ${isCollapsed ? "w-0 opacity-0" : "w-32 opacity-100"}`}
                >
                  Commits
                </span>
              </div>
              <div
                onClick={() =>
                  navigate(
                    `/organizations/${orgId}/workspaces/${workspaceId}/sprints`,
                  )
                }
                className="flex items-center h-10 px-3 gap-2 rounded-lg hover:bg-[#1c1f2e] hover:text-white cursor-pointer transition-colors"
              >
                <CircleArrowDown
                  size={18}
                  className="text-slate-300 shrink-0"
                />
                <span
                  className={`truncate transition-all duration-300 overflow-hidden ${isCollapsed ? "w-0 opacity-0" : "w-32 opacity-100"}`}
                >
                  Sprints
                </span>
              </div>
              <div
                onClick={() => alert("Coming Soon!")}
                className="flex items-center h-10 px-3 gap-2 rounded-lg hover:bg-[#1c1f2e] hover:text-white cursor-pointer transition-colors"
              >
                <GitBranchMinusIcon
                  size={18}
                  className="text-slate-300 shrink-0"
                />
                <span
                  className={`truncate transition-all duration-300 overflow-hidden ${isCollapsed ? "w-0 opacity-0" : "w-32 opacity-100"}`}
                >
                  CI/CD
                </span>
              </div>
              <div
                onClick={() => alert("Coming Soon!")}
                className="flex items-center h-10 px-3 gap-2 rounded-lg hover:bg-[#1c1f2e] hover:text-white cursor-pointer transition-colors"
              >
                <BookOpenText size={18} className="text-slate-300 shrink-0" />
                <span
                  className={`truncate transition-all duration-300 overflow-hidden ${isCollapsed ? "w-0 opacity-0" : "w-32 opacity-100"}`}
                >
                  Wiki
                </span>
              </div>
              <div
                onClick={() => alert("Coming Soon!")}
                className="flex items-center h-10 px-3 gap-2 rounded-lg hover:bg-[#1c1f2e] hover:text-white cursor-pointer transition-colors"
              >
                <MessageCircle size={18} className="text-slate-300 shrink-0" />
                <span
                  className={`truncate transition-all duration-300 overflow-hidden ${isCollapsed ? "w-0 opacity-0" : "w-32 opacity-100"}`}
                >
                  Chat
                </span>
              </div>
              <div
                onClick={() => alert("Coming Soon!")}
                className="flex items-center h-10 px-3 gap-2 rounded-lg hover:bg-[#1c1f2e] hover:text-white cursor-pointer transition-colors"
              >
                <Calendar size={18} className="text-slate-300 shrink-0" />
                <span
                  className={`truncate transition-all duration-300 overflow-hidden ${isCollapsed ? "w-0 opacity-0" : "w-32 opacity-100"}`}
                >
                  Calender
                </span>
              </div>
              <div
                onClick={() =>
                  navigate(
                    `/organizations/${orgId}/workspaces/${workspaceId}/members`,
                  )
                }
                className="flex items-center h-10 px-3 gap-2 rounded-lg hover:bg-[#1c1f2e] hover:text-white cursor-pointer transition-colors"
              >
                <UserRound size={18} className="text-slate-300 shrink-0" />
                <span
                  className={`truncate transition-all duration-300 overflow-hidden ${isCollapsed ? "w-0 opacity-0" : "w-32 opacity-100"}`}
                >
                  Team
                </span>
              </div>
              <div
                onClick={() =>
                  navigate(
                    `/organizations/${orgId}/workspaces/${workspaceId}/settings`,
                  )
                }
                className="flex items-center h-10 px-3 gap-2 rounded-lg hover:bg-[#1c1f2e] hover:text-white cursor-pointer transition-colors"
              >
                <Settings size={18} className="text-slate-300 shrink-0" />
                <span
                  className={`truncate transition-all duration-300 overflow-hidden ${isCollapsed ? "w-0 opacity-0" : "w-32 opacity-100"}`}
                >
                  Settings
                </span>
              </div>
            </div>
          )}
          {!workspaceId && <div className="flex-1" />}
          <div className="mt-auto border-t border-[#ffffff]/10 p-4 flex flex-col gap-2">
            <div
              onClick={() => (window.location.href = "/organization")}
              className={`p-2 flex items-center rounded-lg hover:bg-[#1c1f2e] hover:text-white cursor-pointer ${isCollapsed ? "justify-center" : "gap-2"}`}
            >
              <LayoutDashboard size={20} className="shrink-0" />
              <span
                className={`truncate transition-all duration-300 overflow-hidden ${isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100 block"}`}
              >
                Workspace
              </span>
            </div>
            <div
              onClick={() => navigate("/profile")}
              className={`p-2 flex items-center rounded-lg hover:bg-[#1c1f2e] hover:text-white cursor-pointer ${isCollapsed ? "justify-center" : "gap-2"}`}
            >
              <CircleUserRound size={20} className="shrink-0" />
              <span
                className={`truncate transition-all duration-300 overflow-hidden ${isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100 block"}`}
              >
                Profile
              </span>
            </div>
            {user?.platformRole === "PLATFORM_ADMIN" && (
              <div
                className={`p-2 flex items-center rounded-lg hover:bg-[#1c1f2e] hover:text-white cursor-pointer text-purple-400 ${isCollapsed ? "justify-center" : "gap-2"}`}
                onClick={() => (window.location.href = "/admin")}
              >
                <ShieldCheck size={20} className="shrink-0" />
                <span
                  className={`truncate transition-all duration-300 overflow-hidden ${isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100 block"}`}
                >
                  Admin Panel
                </span>
              </div>
            )}
          </div>
        </div>
      </>
    );
}

export default Sidebar;

