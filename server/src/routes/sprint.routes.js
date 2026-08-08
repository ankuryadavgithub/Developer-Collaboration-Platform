import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  requireWorkspaceMember,
  requireWorkspaceAdmin,
} from "../middleware/workspace.middleware.js";
import {
  createSprint,
  getSprints,
  startSprint,
  completeSprint,
} from "../controllers/sprint.controller.js";

const router = express.Router({ mergeParams: true });

router.get("/", requireAuth, requireWorkspaceMember, getSprints);
router.post("/", requireAuth, requireWorkspaceAdmin, createSprint);
router.post(
  "/:sprintId/start",
  requireAuth,
  requireWorkspaceAdmin,
  startSprint,
);
router.post(
  "/:sprintId/complete",
  requireAuth,
  requireWorkspaceAdmin,
  completeSprint,
);

export default router;
