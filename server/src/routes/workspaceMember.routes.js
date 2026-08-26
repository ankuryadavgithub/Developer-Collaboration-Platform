import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  requireWorkspaceMember,
  requireWorkspaceAdmin,
} from "../middleware/workspace.middleware.js";
import {
  getWorkspaceMembers,
  getAvailableOrgMembers,
  addWorkspaceMember,
  updateWorkspaceMemberRole,
  removeWorkspaceMember,
} from "../controllers/workspaceMember.controller.js";

const router = express.Router({ mergeParams: true });

router.get("/", requireAuth, requireWorkspaceMember, getWorkspaceMembers);
router.get(
  "/available",
  requireAuth,
  requireWorkspaceMember,
  getAvailableOrgMembers,
);
router.post("/", requireAuth, requireWorkspaceAdmin, addWorkspaceMember);
router.patch(
  "/:userId",
  requireAuth,
  requireWorkspaceAdmin,
  updateWorkspaceMemberRole
);
router.delete(
  "/:userId",
  requireAuth,
  requireWorkspaceAdmin,
  removeWorkspaceMember,
);

export default router;
