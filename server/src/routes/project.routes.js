import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  requireWorkspaceMember,
  requireWorkspaceAdmin,
} from "../middleware/workspace.middleware.js";
import {
  createProject,
  getProjects,
  getProjectDetails,
} from "../controllers/project.controller.js";

const router = express.Router({ mergeParams: true });

router.get("/", requireAuth, requireWorkspaceMember, getProjects);
router.get(
  "/:projectId",
  requireAuth,
  requireWorkspaceMember,
  getProjectDetails,
);
router.post("/", requireAuth, requireWorkspaceAdmin, createProject);

export default router;
