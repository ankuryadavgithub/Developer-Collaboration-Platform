import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from "../components/layout/Sidebar.jsx";
import Navbar from "../components/layout/Navbar.jsx";
import StatsGrid from '../components/layout/KPIs/StatsGrid.jsx';
import MiddleSection from '../components/layout/MiddleSection/MiddleSection.jsx';
import LowerMiddleSection from '../components/layout/LowerMiddleSection/LowerMiddleSection.jsx';
import RepositoryHealth from '../components/layout/RepositoryHealthSection/RepositoryHealth.jsx';
import RightSideBar from '../components/layout/RightSideSection/RightSideBar.jsx';

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [githubData, setGithubData] = useState(null);

  // Fetch GitHub data on component mount
  useEffect(() => {
    const fetchGithubData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/auth/github/profile', {
          withCredentials: true // IMPORTANT: This ensures the cookies are sent to the backend
        });
        
        if (response.data.success) {
          setGithubData(response.data.data);
        }
      } catch (error) {
        console.log("No GitHub account linked or token expired.");
      }
    };

    fetchGithubData();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-[#111827] to-indigo-950">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className="flex-1 p-4 w-full h-full overflow-y-auto min-w-0">
        {/* Pass githubData to Navbar to conditionally show/hide the connect icon */}
        <Navbar 
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
          githubData={githubData} 
        />

        {/* GitHub Data Display Section */}
        {githubData && (
          <div className="mt-4 bg-[#1e293b]/80 p-6 rounded-xl border border-slate-700 text-white shadow-sm">
            <h2 className="text-[18px] font-semibold tracking-tight text-slate-100 mb-4">GitHub Profile Connected</h2>
            <div className="flex items-center gap-6">
              <img src={githubData.avatar_url} alt="GitHub Avatar" className="w-16 h-16 rounded-full border-2 border-slate-600" />
              <div>
                <p className="font-semibold text-lg">{githubData.name || githubData.login}</p>
                <p className="text-slate-400 text-sm mb-2">{githubData.bio}</p>
                <div className="flex gap-6 mt-1 text-sm text-slate-400">
                  <span>Public Repos: <span className="font-medium text-slate-200">{githubData.public_repos}</span></span>
                  <span>Followers: <span className="font-medium text-slate-200">{githubData.followers}</span></span>
                  <span>Following: <span className="font-medium text-slate-200">{githubData.following}</span></span>
                </div>
              </div>
            </div>
          </div>
        )}

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