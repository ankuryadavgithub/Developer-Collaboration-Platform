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
  unarchiveWorkspace,
  updateWorkspace,
  deleteWorkspace,
  updateRepository,
  removeRepository,
} from "../controllers/workspace.controller.js";
import {
  getWorkspaceMembers,
  getAvailableOrgMembers,
  addWorkspaceMember,
  updateWorkspaceMemberRole,
  removeWorkspaceMember,
} from "../controllers/workspaceMember.controller.js";

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

router.patch(
  "/:workspaceId/unarchive",
  requireAuth,
  requireWorkspaceAdmin,
  unarchiveWorkspace,
);

router.patch(
  "/:workspaceId",
  requireAuth,
  requireWorkspaceAdmin,
  updateWorkspace,
);

// Workspace Members Operations
router.get(
  "/:workspaceId/members",
  requireAuth,
  requireWorkspaceMember,
  getWorkspaceMembers
);

router.get(
  "/:workspaceId/members/available",
  requireAuth,
  requireWorkspaceMember,
  getAvailableOrgMembers
);

router.post(
  "/:workspaceId/members",
  requireAuth,
  requireWorkspaceAdmin,
  addWorkspaceMember
);

router.patch(
  "/:workspaceId/members/:userId",
  requireAuth,
  requireWorkspaceAdmin,
  updateWorkspaceMemberRole
);

router.delete(
  "/:workspaceId/members/:userId",
  requireAuth,
  requireWorkspaceAdmin,
  removeWorkspaceMember
);

// Day 2: Danger Zone & Repository Routes
router.delete(
  "/:workspaceId",
  requireAuth,
  requireWorkspaceAdmin,
  deleteWorkspace
);

router.post(
  "/:workspaceId/repository",
  requireAuth,
  requireWorkspaceAdmin,
  updateRepository
);

router.delete(
  "/:workspaceId/repository",
  requireAuth,
  requireWorkspaceAdmin,
  removeRepository
);

export default router;
