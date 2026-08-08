import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  requireOrgMember,
  requireOrgManager,
} from "../middleware/org.middleware.js";
import {
  requireWorkspaceMember,
  requireWorkspaceAdmin,
} from "../middleware/workspace.middleware.js";
import {
  createWorkspace,
  getWorkspaces,
  getWorkspaceDetails,
  archiveWorkspace,
} from "../controllers/workspace.controller.js";

// We use mergeParams: true because this router will be nested under /api/organizations/:orgId
const router = express.Router({ mergeParams: true });

// Workspace List & Creation
router.get("/", requireAuth, requireOrgMember, getWorkspaces);
router.post("/", requireAuth, requireOrgManager, createWorkspace);

// Specific Workspace Operations
router.get(
  "/:workspaceId",
  requireAuth,
  requireWorkspaceMember,
  getWorkspaceDetails,
);
router.patch(
  "/:workspaceId/archive",
  requireAuth,
  requireWorkspaceAdmin,
  archiveWorkspace,
);

export default router;
