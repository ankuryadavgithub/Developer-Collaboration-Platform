import React, { useState } from 'react'
import Sidebar from "../components/layout/Sidebar.jsx";
import Navbar from "../components/layout/Navbar.jsx";
import StatsGrid from '../components/layout/KPIs/StatsGrid.jsx';
import MiddleSection from '../components/layout/MiddleSection/MiddleSection.jsx';
import LowerMiddleSection from '../components/layout/LowerMiddleSection/LowerMiddleSection.jsx';
import RepositoryHealth from '../components/layout/RepositoryHealthSection/RepositoryHealth.jsx';
import RightSideBar from '../components/layout/RightSideSection/RightSideBar.jsx';

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-[#111827] to-indigo-950">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className="flex-1 p-4 w-full h-full overflow-y-auto min-w-0">
        <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />


        <div className="mt-4">
          <StatsGrid />
        </div>


        <div className="mt-4 flex flex-col xl:flex-row gap-4 items-start">

          <div className="flex-1 flex flex-col gap-4 min-w-0 w-full">
            <MiddleSection />
            <LowerMiddleSection />
            <RepositoryHealth />
          </div>

          <aside className="w-full xl:w-[320px] flex-shrink-0 sticky top-4">
            <RightSideBar />
          </aside>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;