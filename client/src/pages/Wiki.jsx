import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Plus, Trash2, Save, FileText, ChevronRight, GitBranch, RefreshCw, UploadCloud } from 'lucide-react';
import Sidebar from "../components/layout/Sidebar.jsx";
import Navbar from "../components/layout/Navbar.jsx";

const Wiki = () => {
  const { orgId, workspaceId } = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pages, setPages] = useState([]);
  const [activePageId, setActivePageId] = useState(null);
  const [activePageContent, setActivePageContent] = useState("");
  const [activePageTitle, setActivePageTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isPreview, setIsPreview] = useState(true);

  // Sync state
  const [githubWikiExists, setGithubWikiExists] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [repoInfo, setRepoInfo] = useState(null);
  
  // Bug 3 Fix: Unsaved Changes tracking
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // 1. Fetch the list of pages
  const fetchPages = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/organizations/${orgId}/workspaces/${workspaceId}/wiki`,
        { withCredentials: true }
      );
      setPages(res.data.data);
      // Auto-load the first page if exists, else create new
      if (res.data.data.length > 0 && !activePageId) {
        loadPage(res.data.data[0].id);
      } else if (res.data.data.length === 0) {
        handleNewPage();
      }
    } catch (err) {
      console.error("Failed to load wiki pages", err);
    } finally {
      setLoading(false);
    }
  };

  const checkGithubStatus = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/organizations/${orgId}/workspaces/${workspaceId}/wiki/github/status`,
        { withCredentials: true }
      );
      setGithubWikiExists(res.data.hasWiki);
      if (res.data.repoOwner && res.data.repoName) {
        setRepoInfo({ owner: res.data.repoOwner, name: res.data.repoName });
      }
    } catch (err) {
      console.error("Failed to check GitHub Wiki status", err);
    }
  };

  useEffect(() => {
    if (orgId && workspaceId) {
      fetchPages();
      checkGithubStatus();
    }
  }, [orgId, workspaceId]);

  // 2. Fetch full contents of a specific page
  const loadPage = async (pageId) => {
    if (hasUnsavedChanges) {
      if (!window.confirm("You have unsaved changes. Discard them?")) return;
    }
    
    try {
      setLoading(true);
      const res = await axios.get(
        `http://localhost:5000/api/organizations/${orgId}/workspaces/${workspaceId}/wiki/${pageId}`,
        { withCredentials: true }
      );
      setActivePageId(pageId);
      setActivePageTitle(res.data.data.title);
      setActivePageContent(res.data.data.content || "");
      setIsPreview(true);
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error("Failed to load page content", err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewPage = () => {
    if (hasUnsavedChanges) {
      if (!window.confirm("You have unsaved changes. Discard them?")) return;
    }
    setActivePageId("new");
    setActivePageTitle("Untitled Page");
    setActivePageContent("# Start typing your documentation here...");
    setIsPreview(false);
    setHasUnsavedChanges(false);
  };

  // 3. Save or Update logic
  const handleSave = async () => {
    try {
      setSaving(true);
      if (activePageId === "new") {
        const res = await axios.post(
          `http://localhost:5000/api/organizations/${orgId}/workspaces/${workspaceId}/wiki`,
          { title: activePageTitle, content: activePageContent },
          { withCredentials: true }
        );
        setActivePageId(res.data.data.id);
        fetchPages();
      } else {
        await axios.put(
          `http://localhost:5000/api/organizations/${orgId}/workspaces/${workspaceId}/wiki/${activePageId}`,
          { title: activePageTitle, content: activePageContent },
          { withCredentials: true }
        );
        fetchPages();
      }
      setIsPreview(true);
      setHasUnsavedChanges(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save page");
    } finally {
      setSaving(false);
    }
  };

  // 4. Delete logic
  const handleDelete = async (pageId) => {
    if (!window.confirm("Are you sure you want to delete this page?")) return;
    try {
      await axios.delete(
        `http://localhost:5000/api/organizations/${orgId}/workspaces/${workspaceId}/wiki/${pageId}`,
        { withCredentials: true }
      );
      if (activePageId === pageId) {
        setActivePageId(null);
        setHasUnsavedChanges(false);
      }
      fetchPages();
    } catch (err) {
      alert("Failed to delete page");
    }
  };

  // 5. GitHub Sync Logic
  const handleFetchFromGithub = async () => {
    if (!window.confirm("This will overwrite your local wiki pages with the latest from GitHub. Continue?")) return;
    try {
      setSyncing(true);
      await axios.post(
        `http://localhost:5000/api/organizations/${orgId}/workspaces/${workspaceId}/wiki/github/fetch`, 
        {}, 
        { withCredentials: true }
      );
      await fetchPages();
      if (activePageId && activePageId !== "new") {
        loadPage(activePageId);
      }
      alert("Successfully fetched from GitHub!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to fetch from GitHub.");
    } finally {
      setSyncing(false);
    }
  };

  const handlePushToGithub = async () => {
    try {
      setSyncing(true);
      await axios.post(
        `http://localhost:5000/api/organizations/${orgId}/workspaces/${workspaceId}/wiki/github/push`, 
        {}, 
        { withCredentials: true }
      );
      await fetchPages();
      checkGithubStatus(); 
      alert("Successfully pushed local changes to GitHub!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to push to GitHub.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-[#111827] to-indigo-950">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        <div className="flex-1 flex overflow-hidden p-4 gap-4">
          {/* Navigation Sidebar (Left) */}
          <div className="w-64 bg-[#1c1f2e] border border-slate-800 rounded-xl flex flex-col overflow-hidden shrink-0">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-[#1c1f2e]">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <FileText size={18} className="text-indigo-400" />
                Pages
              </h2>
              <button 
                onClick={handleNewPage}
                className="text-slate-400 hover:text-white bg-indigo-500/10 hover:bg-indigo-500/20 p-1.5 rounded-lg transition-colors"
                title="New Page"
              >
                <Plus size={18} />
              </button>
            </div>
            
            {/* Sync Panel */}
            <div className="p-3 border-b border-slate-800 bg-[#151722] flex flex-col gap-2">
               <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex justify-between items-center">
                  GitHub Sync
                  {syncing && <RefreshCw size={12} className="animate-spin text-indigo-400" />}
               </div>
               
               {githubWikiExists ? (
                 <>
                   <button 
                     onClick={handleFetchFromGithub} 
                     disabled={syncing} 
                     className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors w-full justify-center disabled:opacity-50"
                   >
                     <GitBranch size={14} /> Fetch from GitHub
                   </button>
                   <button 
                     onClick={handlePushToGithub} 
                     disabled={syncing} 
                     className="flex items-center gap-2 px-3 py-1.5 text-sm text-white bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors w-full justify-center shadow-sm disabled:opacity-50"
                   >
                      <UploadCloud size={14} /> Push to GitHub
                   </button>
                 </>
               ) : repoInfo ? (
                 <div className="bg-yellow-500/10 border border-yellow-500/20 p-2 rounded-md text-xs text-yellow-500 text-center flex flex-col gap-2">
                    <span>Wiki not initialized on GitHub.</span>
                    <a 
                      href={`https://github.com/${repoInfo.owner}/${repoInfo.name}/wiki`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="bg-yellow-500 text-slate-900 font-semibold py-1 px-2 rounded-sm hover:bg-yellow-400 transition-colors"
                    >
                      Initialize Now
                    </a>
                    <button 
                      onClick={checkGithubStatus}
                      className="text-slate-400 hover:text-white mt-1 underline"
                    >
                      I've done this, refresh!
                    </button>
                 </div>
               ) : (
                 <div className="text-xs text-slate-500 text-center p-2">Loading repository info...</div>
               )}
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {pages.map(page => (
                <div 
                  key={page.id}
                  onClick={() => loadPage(page.id)}
                  className={`flex justify-between items-center px-3 py-2 rounded-lg cursor-pointer transition-colors group ${
                    activePageId === page.id 
                      ? "bg-indigo-500/20 text-indigo-300" 
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <ChevronRight size={14} className={activePageId === page.id ? "opacity-100" : "opacity-0 group-hover:opacity-100 transition-opacity"} />
                    <span className="truncate">{page.title}</span>
                    {page.isDraft ? (
                      <span className="w-2 h-2 rounded-full bg-yellow-500 shrink-0" title="Unpublished changes"></span>
                    ) : (
                      page.lastSyncedAt && <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" title="Synced with GitHub"></span>
                    )}
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(page.id); }}
                    className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {pages.length === 0 && !loading && (
                <p className="text-slate-500 text-sm text-center p-4">No pages yet</p>
              )}
            </div>
          </div>

          {/* Editor Area (Right) */}
          <div className="flex-1 bg-[#1c1f2e] border border-slate-800 rounded-xl flex flex-col overflow-hidden">
            {activePageId ? (
              <>
                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-[#1c1f2e]">
                  <input 
                    type="text"
                    value={activePageTitle}
                    onChange={(e) => { 
                      setActivePageTitle(e.target.value);
                      setHasUnsavedChanges(true);
                    }}
                    disabled={isPreview}
                    className={`bg-transparent text-xl font-bold text-white outline-none w-1/2 ${isPreview ? "" : "border-b border-indigo-500/50 pb-1"}`}
                    placeholder="Page Title"
                  />
                  <div className="flex items-center gap-3">
                    {hasUnsavedChanges && !isPreview && (
                      <span className="text-xs text-yellow-500">Unsaved changes</span>
                    )}
                    {pages.find(p => p.id === activePageId)?.isDraft && !hasUnsavedChanges && (
                      <span className="text-xs text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-md border border-yellow-500/20">
                        Unpublished Draft
                      </span>
                    )}
                    
                    <button
                      onClick={() => setIsPreview(!isPreview)}
                      className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      {isPreview ? "Edit Page" : "Preview"}
                    </button>
                    {!isPreview && (
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Save size={16} />
                        {saving ? "Saving..." : "Save"}
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 bg-[#0f111a]">
                  {isPreview ? (
                    <div className="prose prose-invert prose-indigo max-w-none">
                      <ReactMarkdown>{activePageContent}</ReactMarkdown>
                    </div>
                  ) : (
                    <textarea
                      value={activePageContent}
                      onChange={(e) => {
                        setActivePageContent(e.target.value);
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full h-full bg-transparent text-slate-200 outline-none resize-none font-mono text-sm leading-relaxed"
                      placeholder="Write your markdown here..."
                    />
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 h-full">
                <FileText size={48} className="mb-4 opacity-50" />
                <p>Select a page or create a new one</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Wiki;
