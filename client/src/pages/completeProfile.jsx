// client/src/pages/completeProfile.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, ArrowRight, Briefcase } from "lucide-react";
import { completeProfile } from "../services/googleAuthService.js";
import { useNavigationLoading } from "../context/NavigationLoadingContext";

function CompleteProfile() {
  const [formData, setFormData] = useState({
    username: "",
    jobTitle: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { goTo } = useNavigationLoading();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (formData.username.trim().length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }

    if (formData.username.includes(" ")) {
      setError("Username cannot contain spaces.");
      return;
    }

    if (!formData.jobTitle) {
      setError("Please select a job title.");
      return;
    }

    try {
      setIsLoading(true);

      const result = await completeProfile({
        username: formData.username,
        jobTitle: formData.jobTitle,
      });

      // Updates the frontend login state used by ProtectedRoute.
      localStorage.setItem("user", JSON.stringify(result.user));

      goTo("/organization", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#D3D3FF] via-[#9400D3] via-[#D8BFD8] to-[#ED80E9] flex items-center justify-center px-4 py-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl rounded-3xl bg-white border border-white/20 shadow-2xl overflow-hidden"
      >
        <div className="bg-linear-to-br from-[#FFFBF5] via-[#FFF7ED] to-[#FEF3C7] p-8 sm:p-10">
          <h1 className="text-3xl font-bold text-slate-800">
            Complete your profile
          </h1>

          <p className="mt-2 mb-8 text-slate-500">
            Choose a username and role to finish setting up your account.
          </p>

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-100 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="mb-5">
            <label
              htmlFor="username"
              className="mb-1.5 block text-sm font-semibold text-slate-700"
            >
              Username
            </label>

            <div className="flex items-center rounded-xl border border-slate-300 bg-white px-3.5 py-3 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-300">
              <User size={18} className="shrink-0 text-violet-500" />

              <input
                id="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a username"
                minLength={3}
                required
                className="ml-3 w-full bg-transparent text-sm outline-none placeholder:text-slate-400 sm:text-base"
              />
            </div>
          </div>

          {/* Job Title Select */}
          <div className="grid grid-cols-1 sm:grid-cols-1 gap-4 mb-4">
            <div>
              <label
                htmlFor="jobTitle"
                className="block text-sm font-semibold text-slate-700 mb-1.5"
              >
                Job Title
              </label>
              <div className="flex items-center bg-white border border-slate-300 rounded-xl px-3.5 py-3 hover:border-violet-300 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-300 transition-all duration-200">
                <Briefcase size={18} className="text-violet-500 shrink-0" />
                <select
                  id="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  className="ml-3 w-full bg-transparent outline-none placeholder:text-slate-400 text-sm sm:text-base cursor-pointer"
                  required
                >
                  <option value="" disabled>
                    Select your job title
                  </option>
                  <option value="project_manager">Project Manager</option>
                  <option value="developer">Developer</option>
                  <option value="frontend_developer">Frontend Developer</option>
                  <option value="backend_developer">Backend Developer</option>
                  <option value="fullstack_developer">Fullstack Developer</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#9400D3] via-[#C026D3] to-[#ED80E9] py-3.5 font-semibold text-white transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? "Completing profile..." : "Complete Profile"}
            {!isLoading && <ArrowRight size={18} />}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CompleteProfile;