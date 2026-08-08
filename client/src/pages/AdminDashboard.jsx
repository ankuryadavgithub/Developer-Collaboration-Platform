import React, { useState, useEffect } from "react";
import axios from "axios";
import { Users, Building2, Settings, Search, ShieldCheck } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Users State
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState(null);
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [userSearch, setUserSearch] = useState("");

  // Orgs State
  const [orgs, setOrgs] = useState([]);
  const [orgsLoading, setOrgsLoading] = useState(false);
  const [orgsError, setOrgsError] = useState(null);
  const [orgPage, setOrgPage] = useState(1);
  const [orgTotalPages, setOrgTotalPages] = useState(1);
  const [orgSearch, setOrgSearch] = useState("");

  // Settings State (Static for now)
  const [allowSignups, setAllowSignups] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const fetchUsers = async () => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/admin/users?page=${userPage}&limit=10&search=${userSearch}`,
        { withCredentials: true }
      );
      setUsers(response.data.data.users);
      setUserTotalPages(response.data.data.pagination.totalPages);
    } catch (err) {
      setUsersError(err.response?.data?.message || "Failed to fetch users");
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchOrgs = async () => {
    setOrgsLoading(true);
    setOrgsError(null);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/admin/organizations?page=${orgPage}&limit=10&search=${orgSearch}`,
        { withCredentials: true }
      );
      setOrgs(response.data.data.organizations);
      setOrgTotalPages(response.data.data.pagination.totalPages);
    } catch (err) {
      setOrgsError(err.response?.data?.message || "Failed to fetch organizations");
    } finally {
      setOrgsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "users") {
      const delay = setTimeout(fetchUsers, 500);
      return () => clearTimeout(delay);
    }
  }, [activeTab, userPage, userSearch]);

  useEffect(() => {
    if (activeTab === "orgs") {
      const delay = setTimeout(fetchOrgs, 500);
      return () => clearTimeout(delay);
    }
  }, [activeTab, orgPage, orgSearch]);

  const renderUsersTab = () => (
    <div className="bg-[#1c1f2e] p-6 rounded-xl border border-[#ffffff]/10 shadow-lg mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2"><Users size={20}/> Manage Users</h2>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search username or email..."
            className="bg-[#0f111a] border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-white outline-none focus:border-purple-500 w-64"
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
          />
        </div>
      </div>

      {usersLoading ? (
        <div className="text-center p-10 text-slate-400">Loading users...</div>
      ) : usersError ? (
        <div className="text-center p-10 text-red-400 bg-red-500/10 rounded-lg">{usersError}</div>
      ) : users.length === 0 ? (
        <div className="text-center p-10 text-slate-400">No users found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0f111a] text-slate-400 text-sm border-b border-[#ffffff]/10">
                <th className="p-4 font-semibold">User</th>
                <th className="p-4 font-semibold">Platform Role</th>
                <th className="p-4 font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-[#ffffff]/10 last:border-0 hover:bg-[#252a3e] transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold uppercase overflow-hidden shrink-0">
                      {user.avatar ? <img src={user.avatar} alt="avatar" className="object-cover h-full w-full" /> : user.username[0]}
                    </div>
                    <div>
                      <div className="font-bold text-white">{user.username}</div>
                      <div className="text-sm text-slate-400">{user.email}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${user.platformRole === "PLATFORM_ADMIN" ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "bg-slate-700 text-slate-300"}`}>
                      {user.platformRole}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-between items-center p-4 border-t border-[#ffffff]/10">
            <button disabled={userPage === 1} onClick={() => setUserPage(userPage - 1)} className="px-4 py-2 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-800 disabled:opacity-50 transition-colors cursor-pointer">Previous</button>
            <span className="text-sm text-slate-400">Page {userPage} of {userTotalPages || 1}</span>
            <button disabled={userPage === userTotalPages || userTotalPages === 0} onClick={() => setUserPage(userPage + 1)} className="px-4 py-2 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-800 disabled:opacity-50 transition-colors cursor-pointer">Next</button>
          </div>
        </div>
      )}
    </div>
  );

  const renderOrgsTab = () => (
    <div className="bg-[#1c1f2e] p-6 rounded-xl border border-[#ffffff]/10 shadow-lg mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2"><Building2 size={20}/> Manage Organizations</h2>
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search organizations..."
            className="bg-[#0f111a] border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-white outline-none focus:border-blue-500 w-64"
            value={orgSearch}
            onChange={(e) => setOrgSearch(e.target.value)}
          />
        </div>
      </div>

      {orgsLoading ? (
        <div className="text-center p-10 text-slate-400">Loading organizations...</div>
      ) : orgsError ? (
        <div className="text-center p-10 text-red-400 bg-red-500/10 rounded-lg">{orgsError}</div>
      ) : orgs.length === 0 ? (
        <div className="text-center p-10 text-slate-400">No organizations found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0f111a] text-slate-400 text-sm border-b border-[#ffffff]/10">
                <th className="p-4 font-semibold">Organization Name</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Total Members</th>
                <th className="p-4 font-semibold">Created</th>
              </tr>
            </thead>
            <tbody>
              {orgs.map((org) => (
                <tr key={org.id} className="border-b border-[#ffffff]/10 last:border-0 hover:bg-[#252a3e] transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-white">{org.name}</div>
                    <div className="text-sm text-slate-400 line-clamp-1">{org.description || "No description"}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full bg-green-500/20 text-green-400`}>
                      ACTIVE
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-300 font-medium">
                    {org._count.members} Members
                  </td>
                  <td className="p-4 text-sm text-slate-400">
                    {new Date(org.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-between items-center p-4 border-t border-[#ffffff]/10">
            <button disabled={orgPage === 1} onClick={() => setOrgPage(orgPage - 1)} className="px-4 py-2 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-800 disabled:opacity-50 transition-colors cursor-pointer">Previous</button>
            <span className="text-sm text-slate-400">Page {orgPage} of {orgTotalPages || 1}</span>
            <button disabled={orgPage === orgTotalPages || orgTotalPages === 0} onClick={() => setOrgPage(orgPage + 1)} className="px-4 py-2 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-800 disabled:opacity-50 transition-colors cursor-pointer">Next</button>
          </div>
        </div>
      )}
    </div>
  );

  const renderSettingsTab = () => (
    <div className="bg-[#1c1f2e] p-6 rounded-xl border border-[#ffffff]/10 shadow-lg mt-6 max-w-3xl">
      <h2 className="text-xl font-bold flex items-center gap-2 mb-6"><Settings size={20}/> Platform Settings</h2>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-[#0f111a] rounded-lg border border-[#ffffff]/10">
          <div>
            <h3 className="text-white font-bold">Allow Public Signups</h3>
            <p className="text-sm text-slate-400">When disabled, new users can only join via invitation.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={allowSignups} onChange={() => setAllowSignups(!allowSignups)} />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-[#0f111a] rounded-lg border border-[#ffffff]/10">
          <div>
            <h3 className="text-white font-bold">Maintenance Mode</h3>
            <p className="text-sm text-slate-400">Disable access for all non-admin users while performing upgrades.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={maintenanceMode} onChange={() => setMaintenanceMode(!maintenanceMode)} />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
          </label>
        </div>

        <div className="flex justify-end pt-4">
          <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-md cursor-pointer">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-[#111827] to-indigo-950">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main className="flex-1 p-4 md:p-8 w-full h-full overflow-y-auto min-w-0">
        <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <div className="text-white max-w-7xl mx-auto mt-6">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-[#ffffff]/10">
            <div className="h-16 w-16 bg-purple-600/20 text-purple-500 rounded-2xl flex items-center justify-center shadow-lg shrink-0">
              <ShieldCheck size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Platform Administration</h1>
              <p className="text-slate-400 mt-1">Manage global users, organizations, and system settings.</p>
            </div>
          </div>

          <div className="flex gap-2 p-1 bg-[#1c1f2e] rounded-xl border border-[#ffffff]/10 w-fit">
            <button 
              onClick={() => setActiveTab("users")}
              className={`px-6 py-2.5 rounded-lg font-semibold transition-all cursor-pointer ${activeTab === "users" ? "bg-purple-600 text-white shadow-md" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}
            >
              Users
            </button>
            <button 
              onClick={() => setActiveTab("orgs")}
              className={`px-6 py-2.5 rounded-lg font-semibold transition-all cursor-pointer ${activeTab === "orgs" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}
            >
              Organizations
            </button>
            <button 
              onClick={() => setActiveTab("settings")}
              className={`px-6 py-2.5 rounded-lg font-semibold transition-all cursor-pointer ${activeTab === "settings" ? "bg-slate-700 text-white shadow-md" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}
            >
              Settings
            </button>
          </div>

          {activeTab === "users" && renderUsersTab()}
          {activeTab === "orgs" && renderOrgsTab()}
          {activeTab === "settings" && renderSettingsTab()}

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
