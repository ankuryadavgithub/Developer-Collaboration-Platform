import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import route from "./routes/auth.routes.js";
import githubRoutes from "./routes/github.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import orgRoutes from "./routes/org.routes.js";
import invitationRoutes from "./routes/invitation.routes.js";
import workspaceRoutes from "./routes/workspace.routes.js";
import workspaceMemberRoutes from "./routes/workspaceMember.routes.js";
import projectRoutes from "./routes/project.routes.js";
import sprintRoutes from "./routes/sprint.routes.js";
import taskRoutes from "./routes/task.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import userRoutes from "./routes/user.routes.js";

const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth",route);
app.use("/api/github", githubRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/organizations", orgRoutes);
app.use("/api/invitations", invitationRoutes);
app.use("/api/notifications", notificationRoutes);
// Base workspace route
app.use("/api/organizations/:orgId/workspaces", workspaceRoutes);

// Sub-routes for the workspace context!
app.use("/api/organizations/:orgId/workspaces/:workspaceId/members", workspaceMemberRoutes);
app.use("/api/organizations/:orgId/workspaces/:workspaceId/projects", projectRoutes);
app.use("/api/organizations/:orgId/workspaces/:workspaceId/sprints", sprintRoutes);
app.use("/api/organizations/:orgId/workspaces/:workspaceId/tasks", taskRoutes);
app.use("/api/organizations/:orgId/workspaces/:workspaceId/dashboard", dashboardRoutes);

// We also mount the github routes here so they have access to the workspace context!
app.use("/api/organizations/:orgId/workspaces/:workspaceId/github", githubRoutes);

app.use("/api/users", userRoutes);

// default route
app.get("/",(req,res) => {
  res.json({
    success: true,
    message: "Developer Collaboration Platform API running"
  });
});

export default app;