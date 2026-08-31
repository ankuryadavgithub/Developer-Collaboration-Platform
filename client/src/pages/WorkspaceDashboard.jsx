import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Sidebar from "../components/layout/Sidebar.jsx";
import Navbar from "../components/layout/Navbar.jsx";
import StatsGrid from '../components/layout/KPIs/StatsGrid.jsx';
import MiddleSection from '../components/layout/MiddleSection/MiddleSection.jsx';
import LowerMiddleSection from '../components/layout/LowerMiddleSection/LowerMiddleSection.jsx';
import RepositoryHealth from '../components/layout/RepositoryHealthSection/RepositoryHealth.jsx';
import RightSideBar from '../components/layout/RightSideSection/RightSideBar.jsx';

const WorkspaceDashboard = () => {
  const { orgId, workspaceId } = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `http://localhost:5000/api/organizations/${orgId}/workspaces/${workspaceId}/dashboard`,
          { withCredentials: true }
        );
        setDashboardData(res.data.data);
      } catch (err) {
        setError("Failed to load workspace dashboard");
      } finally {
        setLoading(false);
      }
    };
    if (orgId && workspaceId) fetchDashboard();
  }, [orgId, workspaceId]);

  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  if (loading) return <div className="text-white p-8 flex justify-center mt-20">Loading workspace dashboard...</div>;
  if (error) return <div className="text-red-400 p-8 flex justify-center mt-20">{error}</div>;

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-[#111827] to-indigo-950">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} user={user} />

      <main className="flex-1 p-4 w-full h-full overflow-y-auto min-w-0">
        <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        <div className="mt-4">
          <StatsGrid kpis={dashboardData?.kpis} />
        </div>

        <div className="mt-4 flex flex-col xl:flex-row gap-4 items-start">
          <div className="flex-1 flex flex-col gap-4 min-w-0 w-full">
            <MiddleSection 
               currentSprint={dashboardData?.currentSprint} 
               projectOverview={dashboardData?.projectOverview} 
            />
            <LowerMiddleSection 
               recentActivity={dashboardData?.recentActivity} 
               orgId={orgId} 
               workspaceId={workspaceId} 
            />
            <RepositoryHealth orgId={orgId} workspaceId={workspaceId} />
          </div>

          <aside className="w-full xl:w-[320px] flex-shrink-0 sticky top-4">
            <RightSideBar />
          </aside>
        </div>
      </main>
    </div>
  );
};

export default WorkspaceDashboard;