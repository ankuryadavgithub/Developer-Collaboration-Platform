import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireWorkspaceMember } from "../middleware/workspace.middleware.js";
import {
  getCurrentSprint,
  getOpenIssues,
  getPullRequests,
  getAccessibleRepositories,
} from "../controllers/github.controller.js";

const router = express.Router({ mergeParams: true });

// Workspace-scoped GitHub routes
router.get(
  "/current-sprint",
  requireAuth,
  requireWorkspaceMember,
  getCurrentSprint,
);
router.get("/issues", requireAuth, requireWorkspaceMember, getOpenIssues);
router.get(
  "/pull-requests",
  requireAuth,
  requireWorkspaceMember,
  getPullRequests,
);

// Global user routes
router.get("/repositories", requireAuth, getAccessibleRepositories);

export default router;
