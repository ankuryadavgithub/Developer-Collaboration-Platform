import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  requireWorkspaceMember,
  requireWorkspaceAdmin,
} from "../middleware/workspace.middleware.js";
import {
  createSprint,
  getSprints,
  updateSprint,
} from "../controllers/sprint.controller.js";

const router = express.Router({ mergeParams: true });

router.get("/", requireAuth, requireWorkspaceMember, getSprints);
router.post("/", requireAuth, requireWorkspaceAdmin, createSprint);
router.patch("/:sprintId", requireAuth, requireWorkspaceAdmin, updateSprint);

export default router;
