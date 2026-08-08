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
  removeWorkspaceMember,
} from "../controllers/workspaceMember.controller.js";

const router = express.Router({ mergeParams: true });

router.get("/", requireAuth, requireWorkspaceMember, getWorkspaceMembers);
router.get(
  "/available",
  requireAuth,
  requireWorkspaceAdmin,
  getAvailableOrgMembers,
);
router.post("/", requireAuth, requireWorkspaceAdmin, addWorkspaceMember);
router.delete(
  "/:userId",
  requireAuth,
  requireWorkspaceAdmin,
  removeWorkspaceMember,
);

export default router;
