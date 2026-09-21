import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useOrganization } from "../context/OrganizationContext";
import { Check, ChevronRight } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

const CreateWorkspaceWizard = () => {
  const { currentOrg } = useOrganization();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1 Data
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [repositoryOption, setRepositoryOption] = useState("CREATE_NEW");

  // Step 2 Data: CREATE_NEW
  const [repoName, setRepoName] = useState("");
  const [repoDesc, setRepoDesc] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);

  // Step 2 Data: CONNECT_EXISTING
  const [githubRepos, setGithubRepos] = useState([]);
  const [selectedRepoId, setSelectedRepoId] = useState("");

  // Fetch GitHub repos automatically when they reach Step 2
  useEffect(() => {
    if (
      step === 2 &&
      repositoryOption === "CONNECT_EXISTING" &&
      githubRepos.length === 0
    ) {
      fetchGithubRepos();
    }
  }, [step, repositoryOption]);

  const fetchGithubRepos = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/github/repositories",
        { withCredentials: true },
      );
      if (res.data.success) setGithubRepos(res.data.data);
    } catch (error) {
      console.error("Failed to fetch github repos", error);
    }
  };

  const handleNext = () => {
    if (step === 1 && !name) return alert("Workspace Name is required!");
    if (step === 2 && repositoryOption === "CREATE_NEW" && !repoName)
      return alert("Repository name is required!");
    if (
      step === 2 &&
      repositoryOption === "CONNECT_EXISTING" &&
      !selectedRepoId
    )
      return alert("Please select a repository!");
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let payload = { name, description, repositoryOption };

      if (repositoryOption === "CREATE_NEW") {
        payload.repositoryName = repoName;
        payload.repositoryDescription = repoDesc;
        payload.isPrivate = isPrivate;
      } else {
        payload.existingRepo = githubRepos.find(
          (r) => r.id.toString() === selectedRepoId.toString(),
        );
      }

      // Hit our shiny new transaction API!
      const res = await axios.post(
        `http://localhost:5000/api/organizations/${currentOrg.id}/workspaces`,
        payload,
        { withCredentials: true },
      );

      if (res.data.success) {
        // Redirect them to the new Workspace Details page (we will build this next)
        navigate(
          `/organizations/${currentOrg.id}/workspaces/${res.data.data.id}/dashboard`,
        );
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to create workspace");
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4 animate-in fade-in">
      <h2 className="text-2xl font-bold mb-4">Workspace Details</h2>
      <div>
        <label className="block text-sm text-slate-400 mb-2">
          Workspace Name
        </label>
        <input
          type="text"
          className="w-full bg-[#0f111a] border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-blue-500"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Developer Collaboration Platform"
        />
      </div>
      <div>
        <label className="block text-sm text-slate-400 mb-2">
          Description (Optional)
        </label>
        <textarea
          className="w-full bg-[#0f111a] border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-blue-500 h-24"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-in fade-in">
      <h2 className="text-2xl font-bold mb-4">GitHub Repository</h2>

      <div className="flex gap-4 mb-6">
        <label
          className={`flex-1 p-4 rounded-xl border cursor-pointer transition-colors ${repositoryOption === "CREATE_NEW" ? "border-blue-500 bg-blue-500/10" : "border-slate-700 bg-[#0f111a] hover:border-slate-500"}`}
        >
          <input
            type="radio"
            className="hidden"
            checked={repositoryOption === "CREATE_NEW"}
            onChange={() => setRepositoryOption("CREATE_NEW")}
          />
          <div className="font-bold mb-1">Create New Repository</div>
          <div className="text-sm text-slate-400">
            Initialize a brand new repository directly on GitHub
          </div>
        </label>
        <label
          className={`flex-1 p-4 rounded-xl border cursor-pointer transition-colors ${repositoryOption === "CONNECT_EXISTING" ? "border-blue-500 bg-blue-500/10" : "border-slate-700 bg-[#0f111a] hover:border-slate-500"}`}
        >
          <input
            type="radio"
            className="hidden"
            checked={repositoryOption === "CONNECT_EXISTING"}
            onChange={() => setRepositoryOption("CONNECT_EXISTING")}
          />
          <div className="font-bold mb-1">Connect Existing</div>
          <div className="text-sm text-slate-400">
            Link an existing GitHub repository to this workspace
          </div>
        </label>
      </div>

      {repositoryOption === "CREATE_NEW" ? (
        <div className="space-y-4 animate-in slide-in-from-right-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Repository Name
            </label>
            <input
              type="text"
              className="w-full bg-[#0f111a] border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-blue-500"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value.replace(/\s+/g, "-"))}
              placeholder="e.g. devhub-backend"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Description
            </label>
            <input
              type="text"
              className="w-full bg-[#0f111a] border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-blue-500"
              value={repoDesc}
              onChange={(e) => setRepoDesc(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Visibility
            </label>
            <select
              className="w-full bg-[#0f111a] border border-slate-700 rounded-lg p-3 text-white outline-none"
              value={isPrivate}
              onChange={(e) => setIsPrivate(e.target.value === "true")}
            >
              <option value={true}>
                Private (Only you and members can see it)
              </option>
              <option value={false}>
                Public (Anyone on the internet can see it)
              </option>
            </select>
          </div>
        </div>
      ) : (
        <div className="space-y-4 animate-in slide-in-from-right-4">
          <label className="block text-sm text-slate-400 mb-2">
            Select Repository
          </label>
          {githubRepos.length === 0 ? (
            <div className="text-sm text-slate-400 p-4 bg-[#0f111a] rounded-lg border border-slate-700">
              Fetching your repositories from GitHub...
            </div>
          ) : (
            <select
              className="w-full bg-[#0f111a] border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-blue-500"
              value={selectedRepoId}
              onChange={(e) => setSelectedRepoId(e.target.value)}
            >
              <option value="">-- Choose a repository --</option>
              {githubRepos.map((repo) => (
                <option key={repo.id} value={repo.id}>
                  {repo.fullName}
                </option>
              ))}
            </select>
          )}
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 animate-in fade-in">
      <h2 className="text-2xl font-bold mb-4">Review & Create</h2>
      <div className="bg-[#0f111a] border border-slate-700 rounded-xl p-6 space-y-6">
        <div>
          <h3 className="text-sm text-slate-400 uppercase font-semibold mb-1">
            Workspace
          </h3>
          <p className="text-xl font-bold">{name}</p>
        </div>
        <div className="pt-4 border-t border-slate-700">
          <h3 className="text-sm text-slate-400 uppercase font-semibold mb-1">
            Repository
          </h3>
          <p className="text-lg font-bold flex items-center gap-2">
            {repositoryOption === "CREATE_NEW"
              ? `Create New: ${repoName}`
              : `Connect Existing: ${githubRepos.find((r) => r.id.toString() === selectedRepoId.toString())?.name}`}
          </p>
        </div>
        <div className="pt-4 border-t border-slate-700">
          <h3 className="text-sm text-slate-400 uppercase font-semibold mb-1">
            Parent Organization
          </h3>
          <p className="font-medium text-slate-300">{currentOrg?.name}</p>
        </div>
      </div>
    </div>
  );

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-[#111827] to-indigo-950">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main className="flex-1 p-4 md:p-8 w-full h-full overflow-y-auto min-w-0">
        <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="text-white max-w-3xl mx-auto mt-6">
          <div className="mb-8 flex items-center gap-4">
            <button
              onClick={() => navigate("/workspaces")}
              className="text-slate-500 hover:text-white transition-colors text-xl"
            >
              ←
            </button>
            <h1 className="text-3xl font-bold">Create Workspace</h1>
          </div>

          <div className="flex items-center justify-between mb-8 relative px-4">
            <div className="absolute top-1/2 left-4 right-4 h-1 bg-slate-700 -z-10 -translate-y-1/2 rounded-full"></div>
            {[1, 2, 3].map((num) => (
              <div
                key={num}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 border-[#0f111a] transition-colors ${step >= num ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-500"}`}
              >
                {step > num ? <Check size={16} /> : num}
              </div>
            ))}
          </div>

          <div className="bg-[#1c1f2e] p-8 rounded-xl border border-[#ffffff]/10 mb-6 min-h-[400px] shadow-lg">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep(step - 1)}
              disabled={step === 1 || loading}
              className={`px-6 py-2 rounded-lg font-bold transition-colors ${step === 1 ? "opacity-0 cursor-default" : "bg-slate-800 hover:bg-slate-700 text-white cursor-pointer shadow-md"}`}
            >
              Back
            </button>

            {step < 3 ? (
              <button
                onClick={handleNext}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-md"
              >
                Next <ChevronRight size={18} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-8 rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-md"
              >
                {loading ? "Creating..." : "Create Workspace"}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateWorkspaceWizard;
