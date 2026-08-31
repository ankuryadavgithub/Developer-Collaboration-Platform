import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireWorkspaceMember } from "../middleware/workspace.middleware.js";
import {
  getCurrentSprint,
  getOpenIssues,
  getPullRequests,
  getAccessibleRepositories,
  handleGithubWebhook,
  getCommits,
  getBranches,
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

router.get("/commits", requireAuth, requireWorkspaceMember, getCommits);

router.get("/branches", requireAuth, requireWorkspaceMember, getBranches);

// Global user routes
router.get("/repositories", requireAuth, getAccessibleRepositories);

// Webhook receiver (no auth middleware because GitHub calls this directly)
router.post("/webhook", express.json({type: 'application/json'}), handleGithubWebhook);

export default router;
