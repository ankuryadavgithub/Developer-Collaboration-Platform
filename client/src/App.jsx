import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Forgotpassword from "./pages/forgotpassword";
import Dashboard from "./pages/dashboard";
import CompleteProfile from "./pages/completeProfile";
import ProtectedRoute from "./components/common/ProtectedRoute";
import PageLoader from "./components/common/PageLoader";
import {
  NavigationLoadingProvider,
  useNavigationLoading,
} from "./context/NavigationLoadingContext";
import "./index.css";
import GithubCallback from "./pages/githubCallback";

function AppRoutes() {
  const location = useLocation();
  const { goTo } = useNavigationLoading();

  const handleLinkClick = (event) => {
    const link = event.target.closest("a");

    if (
      !link ||
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      link.target === "_blank" ||
      link.hasAttribute("download")
    ) {
      return;
    }

    const url = new URL(link.href, window.location.origin);

    // Do not intercept external links, such as normal GitHub links.
    if (url.origin !== window.location.origin) {
      return;
    }

    const destination = `${url.pathname}${url.search}${url.hash}`;
    const currentPage = `${location.pathname}${location.search}${location.hash}`;

    // Do not show a loader for a link to the page already open.
    if (destination === currentPage) {
      return;
    }

    event.preventDefault();

    goTo(destination);
  };

  return (
    <div onClickCapture={handleLinkClick}>
      <PageLoader />

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgotpassword" element={<Forgotpassword />} />
        <Route path="/auth/github/callback" element={<GithubCallback />} />

        <Route
          path="/complete-profile"
          element={
            <ProtectedRoute>
              <CompleteProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <NavigationLoadingProvider>
        <AppRoutes />
      </NavigationLoadingProvider>
    </BrowserRouter>
  );
}

export default App;