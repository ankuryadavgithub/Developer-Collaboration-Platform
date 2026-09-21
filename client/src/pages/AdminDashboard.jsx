import React, { useState, useEffect } from "react";
import Navbar from "../components/layout/Navbar";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminOverview from "../components/admin/AdminOverview";
import AdminUsers from "../components/admin/AdminUsers";
import AdminOrganizations from "../components/admin/AdminOrganizations";
import AdminWorkspaces from "../components/admin/AdminWorkspaces";
import AdminAuditLogs from "../components/admin/AdminAuditLogs";
import AdminSettings from "../components/admin/AdminSettings";
import AdminSecurity from "../components/admin/AdminSecurity";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        console.error("Failed to parse user from local storage");
      }
    }
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <AdminOverview user={user} />;
      case "users":
        return <AdminUsers />;
      case "orgs":
        return <AdminOrganizations />;
      case "workspaces":
        return <AdminWorkspaces />;
      case "audit":
        return <AdminAuditLogs />;
      case "settings":
        return <AdminSettings />;
      case "security":
        return <AdminSecurity />;
      default:
        return <AdminOverview user={user} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#050508]">
      {/* 
        We use the new dedicated AdminSidebar instead of the global application Sidebar 
        to provide a focused, full-height administration experience as per the redesign.
      */}
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden min-w-0 bg-[#0a0c10]">
        <Navbar toggleSidebar={() => {}} /> {/* Empty function since Admin sidebar isn't collapsible in the same way yet */}
        
        <div className="flex-1 overflow-hidden relative">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
