import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { 
  Plus, Trash2, Save, FileText, ChevronRight, ChevronDown, 
  GitBranch, RefreshCw, UploadCloud, Search, Star, Folder,
  MoreVertical, Edit2
} from 'lucide-react';
import Sidebar from "../components/layout/Sidebar.jsx";
import Navbar from "../components/layout/Navbar.jsx";

const extractText = (children) => {
  if (typeof children === 'string') return children;
  if (Array.isArray(children)) return children.map(extractText).join('');
  if (children && children.props && children.props.children) return extractText(children.props.children);
  return '';
};

const generateId = (text) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

const Heading = ({ level, children, ...props }) => {
  const text = extractText(children);
  const id = generateId(text);
  const Tag = `h${level}`;
  return <Tag id={id} {...props}>{children}</Tag>;
};

const Wiki = () => {
  const { orgId, workspaceId } = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pages, setPages] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activePageId, setActivePageId] = useState(null);
  const [activePageContent, setActivePageContent] = useState("");
  const [activePageTitle, setActivePageTitle] = useState("");
  const [isStarred, setIsStarred] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isPreview, setIsPreview] = useState(true);
  
  // Tree state
  const [expandedFolders, setExpandedFolders] = useState({});

  // Sync state
  const [githubWikiExists, setGithubWikiExists] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [repoInfo, setRepoInfo] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const fetchPages = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/organizations/${orgId}/workspaces/${workspaceId}/wiki`,
        { withCredentials: true }
      );
      setPages(res.data.data);
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
      setIsStarred(res.data.data.isStarred || false);
      setIsPreview(true);
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error("Failed to load page content", err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewPage = () => {
    if (activePageId === "new") {
      alert("Please save the current new page before creating another one.");
      return;
    }
    
    if (hasUnsavedChanges) {
      if (!window.confirm("You have unsaved changes. Discard them?")) return;
    }
    setActivePageId("new");
    setActivePageTitle("New Page");
    setActivePageContent("# Start typing your documentation here...");
    setIsStarred(false);
    setIsPreview(false);
    setHasUnsavedChanges(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (activePageId === "new") {
        const res = await axios.post(
          `http://localhost:5000/api/organizations/${orgId}/workspaces/${workspaceId}/wiki`,
          { title: activePageTitle, content: activePageContent, isStarred },
          { withCredentials: true }
        );
        setActivePageId(res.data.data.id);
        fetchPages();
      } else {
        await axios.put(
          `http://localhost:5000/api/organizations/${orgId}/workspaces/${workspaceId}/wiki/${activePageId}`,
          { title: activePageTitle, content: activePageContent, isStarred },
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

  const handleToggleStar = async () => {
    const newStatus = !isStarred;
    setIsStarred(newStatus);
    
    if (activePageId === "new") {
      setHasUnsavedChanges(true);
      return;
    }
    
    try {
      await axios.put(
        `http://localhost:5000/api/organizations/${orgId}/workspaces/${workspaceId}/wiki/${activePageId}`,
        { isStarred: newStatus },
        { withCredentials: true }
      );
      fetchPages(); // refresh tree
    } catch (err) {
      setIsStarred(!newStatus);
      alert("Failed to update star status");
    }
  };

  // Build tree structure
  const buildTree = () => {
    const tree = [];
    
    // Filter by search query
    const filteredPages = pages.filter(p => 
      p.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    filteredPages.forEach(page => {
      const parts = page.title.split('/');
      let currentLevel = tree;
      let pathSoFar = "";

      parts.forEach((part, index) => {
        pathSoFar += (pathSoFar ? "/" : "") + part;
        const isFile = index === parts.length - 1;

        let existing = currentLevel.find(item => item.name === part);

        if (!existing) {
          existing = {
            name: part,
            path: pathSoFar,
            isFile: isFile,
            pageId: isFile ? page.id : null,
            page: isFile ? page : null,
            children: []
          };
          currentLevel.push(existing);
        } else if (isFile) {
          existing.isFile = true;
          existing.pageId = page.id;
          existing.page = page;
        }

        currentLevel = existing.children;
      });
    });

    return tree;
  };

  const toggleFolder = (path, e) => {
    if (e) e.stopPropagation();
    setExpandedFolders(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  const renderTree = (nodes, level = 0) => {
    return nodes.map(node => {
      const isActive = activePageId === node.pageId;
      const isExpanded = expandedFolders[node.path] !== false; // Default to expanded
      const hasChildren = node.children.length > 0;

      return (
        <div key={node.path} className="flex flex-col">
          <div 
            onClick={() => {
              if (node.pageId) loadPage(node.pageId);
              if (hasChildren && !node.pageId) toggleFolder(node.path);
            }}
            className={`flex justify-between items-center px-3 py-2 rounded-lg cursor-pointer transition-colors group ${
              isActive 
                ? "bg-indigo-500/20 text-indigo-300" 
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
            style={{ paddingLeft: `${level * 12 + 12}px` }}
          >
            <div className="flex items-center gap-2 truncate">
              {hasChildren ? (
                <button 
                  onClick={(e) => toggleFolder(node.path, e)}
                  className="p-0.5 hover:bg-slate-700 rounded"
                >
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
              ) : (
                <span className="w-[18px]"></span> // Spacer
              )}
              
              {node.pageId ? (
                <FileText size={14} className={isActive ? "text-indigo-400" : "text-slate-500"} />
              ) : (
                <Folder size={14} className="text-slate-500" />
              )}
              
              <span className="truncate text-sm">{node.name}</span>
              
              {node.page && node.page.isStarred && (
                <Star size={12} className="text-yellow-500 fill-yellow-500 shrink-0" />
              )}
              
              {node.page && node.page.isDraft && (
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 shrink-0" title="Unpublished changes"></span>
              )}
            </div>
            
            {node.pageId && (
              <button 
                onClick={(e) => { e.stopPropagation(); handleDelete(node.pageId); }}
                className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
          
          {hasChildren && isExpanded && (
            <div className="flex flex-col">
              {renderTree(node.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  const generateTOC = () => {
    if (!activePageContent) return [];
    const toc = [];
    const regex = /^(#{1,3})\s+(.+)$/gm;
    let match;
    while ((match = regex.exec(activePageContent)) !== null) {
      toc.push({
        level: match[1].length,
        text: match[2],
        id: generateId(match[2]),
      });
    }
    return toc;
  };

  const activePage = pages.find(p => p.id === activePageId);
  const tree = buildTree();
  const toc = generateTOC();

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f111a]">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden p-2 sm:p-4 gap-4">
          
          {/* Navigation Sidebar (Left) */}
          <div className="w-full lg:w-64 bg-[#1c1f2e] border border-slate-800 rounded-xl flex flex-col overflow-hidden shrink-0 shadow-lg h-64 lg:h-auto">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
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
            
            <div className="p-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
                <input 
                  type="text"
                  placeholder="Search pages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#151722] text-sm text-slate-200 border border-slate-700 rounded-md py-1.5 pl-8 pr-3 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
              {renderTree(tree)}
              {tree.length === 0 && !loading && (
                <p className="text-slate-500 text-sm text-center p-4">No pages found</p>
              )}
            </div>

            {/* Sync Panel at bottom */}
            <div className="p-4 border-t border-slate-800 bg-[#151722] flex flex-col gap-3">
               <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex justify-between items-center">
                  GITHUB SYNC
                  {syncing && <RefreshCw size={12} className="animate-spin text-indigo-400" />}
               </div>
               
               {githubWikiExists ? (
                 <div className="flex gap-2">
                   <button 
                     onClick={handleFetchFromGithub} 
                     disabled={syncing} 
                     className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors disabled:opacity-50"
                     title="Fetch from GitHub"
                   >
                     <GitBranch size={14} /> Pull
                   </button>
                   <button 
                     onClick={handlePushToGithub} 
                     disabled={syncing} 
                     className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded transition-colors shadow-sm disabled:opacity-50"
                     title="Push to GitHub"
                   >
                      <UploadCloud size={14} /> Push
                   </button>
                 </div>
               ) : repoInfo ? (
                 <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg text-xs text-center flex flex-col gap-2">
                    <span className="text-yellow-500 font-medium">Wiki not initialized on GitHub.</span>
                    <span className="text-slate-400">You can connect your repository to enable sync.</span>
                    <a 
                      href={`https://github.com/${repoInfo.owner}/${repoInfo.name}/wiki`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="bg-yellow-500 text-slate-900 font-semibold py-1.5 px-2 rounded hover:bg-yellow-400 transition-colors mt-1"
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
          </div>

          {/* Main Editor Area (Middle) */}
          <div className="flex-1 bg-[#1c1f2e] border border-slate-800 rounded-xl flex flex-col overflow-hidden shadow-lg relative min-h-[600px] lg:min-h-0">
            {activePageId ? (
              <>
                {/* Top Navigation & Actions */}
                <div className="px-4 sm:px-6 py-4 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1c1f2e]">
                  <div className="text-sm text-slate-400 flex items-center gap-2">
                    <Folder size={14} />
                    <span>Workspace Wiki</span>
                    <ChevronRight size={14} />
                    <span className="text-slate-200 truncate max-w-[200px]">{activePageTitle}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {!isPreview && (
                       <button
                         onClick={handleSave}
                         disabled={saving}
                         className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors disabled:opacity-50"
                       >
                         <Save size={14} />
                         {saving ? "Saving..." : "Save Draft"}
                       </button>
                    )}
                    
                    <button
                      onClick={handlePushToGithub}
                      disabled={syncing || !githubWikiExists}
                      className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors disabled:opacity-50"
                    >
                      <UploadCloud size={14} />
                      Publish
                    </button>
                  </div>
                </div>

                {/* Page Header */}
                <div className="px-4 sm:px-8 pt-6 sm:pt-8 pb-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <div className="flex items-center gap-3 w-full sm:w-3/4">
                      <FileText size={24} className="sm:w-7 sm:h-7 text-indigo-400 shrink-0" />
                      <input 
                        type="text"
                        value={activePageTitle}
                        onChange={(e) => { 
                          setActivePageTitle(e.target.value);
                          setHasUnsavedChanges(true);
                        }}
                        disabled={isPreview}
                        className={`bg-transparent text-3xl font-bold text-white outline-none w-full ${isPreview ? "" : "border-b border-indigo-500/50 pb-1"}`}
                        placeholder="Page Title (e.g. Folder/My Page)"
                      />
                      <Star 
                        size={24} 
                        onClick={handleToggleStar}
                        className={`shrink-0 cursor-pointer transition-colors ${isStarred ? "text-yellow-500 fill-yellow-500 hover:text-yellow-400" : "text-slate-600 hover:text-yellow-500"}`} 
                      />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsPreview(!isPreview)}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors"
                      >
                        {isPreview ? <><Edit2 size={14}/> Edit Page</> : "Preview"}
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="text-slate-400 text-sm mb-4">
                    Add a description or context for this documentation page...
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-500">
                    <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-medium">
                      {activePage?.createdById ? "U" : "A"}
                    </div>
                    <span>{activePage?.createdById ? "User" : "Ankur Yadav"}</span>
                    <span>•</span>
                    <span>Last updated {activePage?.updatedAt ? new Date(activePage.updatedAt).toLocaleDateString() : 'just now'}</span>
                    
                    {(activePage?.isDraft || hasUnsavedChanges) && (
                      <>
                        <span>•</span>
                        <span className="text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded text-xs border border-yellow-500/20 font-medium">
                          {hasUnsavedChanges ? "Unsaved Changes" : "Unpublished Draft"}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto px-4 sm:px-8 pb-8 bg-[#0f111a] mx-2 sm:mx-4 mb-2 sm:mb-4 rounded-xl border border-slate-800 shadow-inner">
                  {isPreview ? (
                    <div className="prose prose-invert prose-indigo max-w-none pt-6 pb-24">
                      <ReactMarkdown 
                        components={{
                          h1: (props) => <Heading level={1} {...props} />,
                          h2: (props) => <Heading level={2} {...props} />,
                          h3: (props) => <Heading level={3} {...props} />,
                        }}
                      >
                        {activePageContent}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <textarea
                      value={activePageContent}
                      onChange={(e) => {
                        setActivePageContent(e.target.value);
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full h-full bg-transparent text-slate-200 outline-none resize-none font-mono text-sm leading-relaxed pt-6 pb-24"
                      placeholder="Write your markdown here..."
                    />
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 h-full">
                <FileText size={64} className="mb-6 opacity-20" />
                <h3 className="text-xl font-semibold text-slate-300 mb-2">Workspace Wiki</h3>
                <p className="max-w-md text-center mb-6 text-sm">Create and organize documentation for your team. Use folders to structure your content.</p>
                <button 
                  onClick={handleNewPage}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-lg"
                >
                  <Plus size={16} /> Create your first page
                </button>
              </div>
            )}
          </div>

          {/* Right Sidebar (Table of Contents) */}
          {activePageId && isPreview && toc.length > 0 && (
            <div className="hidden xl:flex w-64 bg-[#1c1f2e] border border-slate-800 rounded-xl flex-col overflow-hidden shrink-0 shadow-lg">
              <div className="p-4 border-b border-slate-800">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  On this page
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {toc.map((item, index) => (
                  <a
                    key={index}
                    href={`#${item.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      const element = document.getElementById(item.id);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                    className={`block text-sm py-1 transition-colors ${
                      item.level === 1 ? "text-slate-200 font-medium" : 
                      item.level === 2 ? "text-slate-400 pl-3" : 
                      "text-slate-500 pl-6"
                    } hover:text-indigo-400`}
                  >
                    {item.text}
                  </a>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default Wiki;
