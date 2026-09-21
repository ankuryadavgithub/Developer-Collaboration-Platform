import React, { useState, useEffect } from "react";
import axios from "axios";
import { User, Shield, Link as LinkIcon, Loader2, Settings } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";
import { GoogleLogin } from "@react-oauth/google";
import googleIcon from "../assets/google.svg";
import githubIcon from "../assets/github.svg";

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // For mobile sidebar
  const [connections, setConnections] = useState({ google: false, github: false });

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    jobTitle: "",
    avatar: ""
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users/me", { withCredentials: true });
        setFormData({
          username: res.data.data.username || "",
          email: res.data.data.email || "",
          jobTitle: res.data.data.jobTitle || "",
          avatar: res.data.data.avatar || ""
        });
        setConnections({
          google: !!res.data.data.googleId,
          github: !!res.data.data.githubId
        });
      } catch (err) {
        setMessage({ type: "error", text: "Failed to load profile data." });
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleGeneralSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: "", text: "" });
    try {
      const res = await axios.patch("http://localhost:5000/api/users/me", formData, { withCredentials: true });
      setMessage({ type: "success", text: "Profile updated successfully!" });
      
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...storedUser, ...res.data.data }));
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Update failed." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSecuritySubmit = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return setMessage({ type: "error", text: "New passwords do not match." });
    }
    setIsSaving(true);
    setMessage({ type: "", text: "" });
    try {
      await axios.patch("http://localhost:5000/api/users/me/password", {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      }, { withCredentials: true });
      setMessage({ type: "success", text: "Password changed successfully!" });
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Password update failed." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-[#111827] to-indigo-950">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <main className="flex-1 p-4 w-full h-full overflow-y-auto min-w-0">
        <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <div className="max-w-5xl mx-auto mt-6">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#ffffff]/10">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
                <Settings size={32} className="text-violet-500" /> Account Settings
              </h1>
              <p className="text-slate-400 mt-1">
                Manage your profile, security, and integrations
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-violet-500" size={40} />
            </div>
          ) : (
            <>
              {message.text && (
                <div className={`mb-6 rounded-xl p-4 text-sm font-medium ${message.type === "success" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                  {message.text}
                </div>
              )}

              <div className="flex flex-col gap-8 md:flex-row">
                {/* Tabs sidebar */}
                <div className="flex w-full flex-col gap-2 md:w-64">
                  <button onClick={() => { setActiveTab("general"); setMessage({type:"", text:""}) }} className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${activeTab === "general" ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20" : "hover:bg-[#1c1f2e] text-slate-400 hover:text-slate-200"}`}>
                    <User size={18} /> General
                  </button>
                  <button onClick={() => { setActiveTab("security"); setMessage({type:"", text:""}) }} className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${activeTab === "security" ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20" : "hover:bg-[#1c1f2e] text-slate-400 hover:text-slate-200"}`}>
                    <Shield size={18} /> Security
                  </button>
                  <button onClick={() => { setActiveTab("integrations"); setMessage({type:"", text:""}) }} className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${activeTab === "integrations" ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20" : "hover:bg-[#1c1f2e] text-slate-400 hover:text-slate-200"}`}>
                    <LinkIcon size={18} /> Integrations
                  </button>
                </div>

                {/* Tab Content */}
                <div className="flex-1 rounded-2xl border border-[#ffffff]/10 bg-[#1c1f2e]/50 p-6 shadow-xl backdrop-blur-sm">
                  
                  {/* GENERAL TAB */}
                  {activeTab === "general" && (
                    <form onSubmit={handleGeneralSubmit} className="flex flex-col gap-6">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-300">Email Address (Read-only)</label>
                        <input type="email" value={formData.email} disabled className="w-full bg-[#0f111a] border border-slate-700/50 rounded-lg p-3 text-slate-500 outline-none cursor-not-allowed" />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-300">Username</label>
                        <input type="text" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} className="w-full bg-[#0f111a] border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500" required />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-300">Job Title</label>
                        <select
                          value={formData.jobTitle}
                          onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
                          className="w-full bg-[#0f111a] border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 cursor-pointer appearance-none"
                          required
                        >
                          <option value="" disabled className="text-slate-500">
                            Select your role
                          </option>
                          <option value="project_manager">Project Manager</option>
                          <option value="developer">Developer</option>
                          <option value="frontend_developer">Frontend Developer</option>
                          <option value="backend_developer">Backend Developer</option>
                          <option value="fullstack_developer">Full Stack Developer</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-300">Avatar URL</label>
                        <input type="url" value={formData.avatar} onChange={(e) => setFormData({...formData, avatar: e.target.value})} className="w-full bg-[#0f111a] border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500" placeholder="https://example.com/my-photo.jpg" />
                      </div>
                      <div className="mt-2 flex justify-end">
                        <button type="submit" disabled={isSaving} className="bg-violet-600 hover:bg-violet-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors cursor-pointer disabled:opacity-50">
                          {isSaving ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* SECURITY TAB */}
                  {activeTab === "security" && (
                    <form onSubmit={handleSecuritySubmit} className="flex flex-col gap-6">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-300">Current Password</label>
                        <input type="password" value={passwords.currentPassword} onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})} className="w-full bg-[#0f111a] border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500" required />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-300">New Password</label>
                        <input type="password" value={passwords.newPassword} onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})} className="w-full bg-[#0f111a] border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500" required minLength={6} />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-300">Confirm New Password</label>
                        <input type="password" value={passwords.confirmPassword} onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})} className="w-full bg-[#0f111a] border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500" required minLength={6} />
                      </div>
                      <div className="mt-2 flex justify-end">
                        <button type="submit" disabled={isSaving} className="bg-violet-600 hover:bg-violet-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors cursor-pointer disabled:opacity-50">
                          {isSaving ? "Updating..." : "Update Password"}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* INTEGRATIONS TAB */}
                  {activeTab === "integrations" && (
                    <div className="flex flex-col gap-6">
                      
                      {/* GitHub Integration */}
                      <div className="flex items-center justify-between rounded-xl border border-slate-700 bg-[#0f111a] p-5">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white p-2">
                            <img src={githubIcon} alt="GitHub" className="h-8 w-8" />
                          </div>
                          <div>
                            <h3 className="font-bold text-white">GitHub</h3>
                            <p className="text-sm text-slate-400">
                              {connections.github ? "Connected" : "Not connected"}
                            </p>
                          </div>
                        </div>
                        {connections.github ? (
                          <button
                            onClick={async () => {
                              try {
                                await axios.delete("http://localhost:5000/api/users/me/github", { withCredentials: true });
                                setConnections({ ...connections, github: false });
                                setMessage({ type: "success", text: "GitHub disconnected." });
                              } catch (err) {
                                setMessage({ type: "error", text: err.response?.data?.message || "Failed to disconnect." });
                              }
                            }}
                            className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/20"
                          >
                            Disconnect
                          </button>
                        ) : (
                          <button
                            onClick={() => window.location.href = "http://localhost:5000/api/auth/github?action=connect"}
                            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-slate-200"
                          >
                            Connect
                          </button>
                        )}
                      </div>

                      {/* Google Integration */}
                      <div className="flex items-center justify-between rounded-xl border border-slate-700 bg-[#0f111a] p-5">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white p-2">
                            <img src={googleIcon} alt="Google" className="h-8 w-8" />
                          </div>
                          <div>
                            <h3 className="font-bold text-white">Google</h3>
                            <p className="text-sm text-slate-400">
                              {connections.google ? "Connected" : "Not connected"}
                            </p>
                          </div>
                        </div>
                        {connections.google ? (
                          <button
                            onClick={async () => {
                              try {
                                await axios.delete("http://localhost:5000/api/users/me/google", { withCredentials: true });
                                setConnections({ ...connections, google: false });
                                setMessage({ type: "success", text: "Google disconnected." });
                              } catch (err) {
                                setMessage({ type: "error", text: err.response?.data?.message || "Failed to disconnect." });
                              }
                            }}
                            className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/20"
                          >
                            Disconnect
                          </button>
                        ) : (
                          <div className="overflow-hidden rounded-lg">
                            <GoogleLogin
                              onSuccess={async (credentialResponse) => {
                                try {
                                  await axios.post("http://localhost:5000/api/users/me/google", 
                                    { credential: credentialResponse.credential }, 
                                    { withCredentials: true }
                                  );
                                  setConnections({ ...connections, google: true });
                                  setMessage({ type: "success", text: "Google connected!" });
                                } catch (err) {
                                  setMessage({ type: "error", text: err.response?.data?.message || "Failed to connect Google." });
                                }
                              }}
                              onError={() => setMessage({ type: "error", text: "Google login failed." })}
                              type="standard"
                              theme="filled_black"
                              size="medium"
                              text="signin_with"
                              shape="rectangular"
                            />
                          </div>
                        )}
                      </div>

                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserProfile;