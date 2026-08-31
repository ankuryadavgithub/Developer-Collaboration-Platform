// client/src/components/common/PageLoader.jsx

import { LoaderCircle } from "lucide-react";
import { useNavigationLoading } from "../../context/NavigationLoadingContext.jsx";

function PageLoader() {
  const { isNavigating } = useNavigationLoading();

  if (!isNavigating) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 backdrop-blur-[2px]">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900 px-5 py-4 text-sm font-medium text-white shadow-2xl">
        <LoaderCircle size={22} className="animate-spin text-violet-400" />
        Loading...
      </div>
    </div>
  );
}

export default PageLoader;