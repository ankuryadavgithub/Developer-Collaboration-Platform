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
import WorkspaceDashboard from "./pages/WorkspaceDashboard";
import CompleteProfile from "./pages/completeProfile";
import ProtectedRoute from "./components/common/ProtectedRoute";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import AdminDashboard from "./pages/AdminDashboard";
import OrganizationDashboard from "./pages/OrganizationDashboard";
import OrganizationMembers from "./pages/OrganizationMembers";
import Workspaces from "./pages/Workspaces";
import CreateWorkspaceWizard from "./pages/CreateWorkspaceWizard";
import WorkspaceDetails from "./pages/WorkspaceDetails";
import Invitations from "./pages/Invitations";
import PageLoader from "./components/common/PageLoader";
import {
  NavigationLoadingProvider,
  useNavigationLoading,
} from "./context/NavigationLoadingContext";
import "./index.css";
import GithubCallback from "./pages/githubCallback";
import Projects from "./pages/Projects";
import Sprints from "./pages/Sprints";
import TasksKanban from "./pages/TasksKanban";

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
          path="/organizations/:orgId/workspaces/:workspaceId/dashboard"
          element={
            <ProtectedRoute>
              <WorkspaceDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/organizations/:orgId/workspaces/:workspaceId/projects"
          element={
            <ProtectedRoute>
              <Projects />
            </ProtectedRoute>
          }
        />

        <Route
          path="/organizations/:orgId/workspaces/:workspaceId/sprints"
          element={
            <ProtectedRoute>
              <Sprints />
            </ProtectedRoute>
          }
        />

        <Route
          path="/organizations/:orgId/workspaces/:workspaceId/tasks"
          element={
            <ProtectedRoute>
              <TasksKanban />
            </ProtectedRoute>
          }
        />

        {/* Organization Routes Protected by Auth */}
        <Route
          path="/organization"
          element={
            <ProtectedRoute>
              <OrganizationDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/workspaces"
          element={
            <ProtectedRoute>
              <Workspaces />
            </ProtectedRoute>
          }
        />

        <Route
          path="/organizations/:orgId/workspaces/:workspaceId"
          element={
            <ProtectedRoute>
              <WorkspaceDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/organizations/:orgId/workspaces/create"
          element={
            <ProtectedRoute>
              <CreateWorkspaceWizard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/organizations/:orgId/members"
          element={
            <ProtectedRoute>
              <OrganizationMembers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/invitations"
          element={
            <ProtectedRoute>
              <Invitations />
            </ProtectedRoute>
          }
        />

        <Route element={<ProtectedAdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        <Route path="*" element={<Navigate to="/organization" replace />} />
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