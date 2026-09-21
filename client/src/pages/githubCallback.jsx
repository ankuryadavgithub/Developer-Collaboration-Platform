// client/src/pages/githubCallback.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoaderCircle } from "lucide-react";
import { getCurrentUser } from "../services/googleAuthService.js";

function GithubCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    const finishGithubLogin = async () => {
      try {
        const result = await getCurrentUser();

        localStorage.setItem("user", JSON.stringify(result.user));

        if (result.user.profileCompleted) {
          navigate("/organization", { replace: true });
        } else {
          navigate("/complete-profile", { replace: true });
        }
      } catch (error) {
        setError("GitHub login failed. Please try again.");

        window.setTimeout(() => {
          navigate("/login", { replace: true });
        }, 2000);
      }
    };

    finishGithubLogin();
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="rounded-2xl border border-slate-700 bg-slate-900 px-8 py-7 text-center shadow-2xl">
        {error ? (
          <p className="text-sm text-red-400">{error}</p>
        ) : (
          <>
            <LoaderCircle
              size={30}
              className="mx-auto animate-spin text-violet-400"
            />

            <p className="mt-4 text-sm font-medium text-white">
              Completing GitHub login...
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default GithubCallback;