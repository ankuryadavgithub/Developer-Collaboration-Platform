import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireWorkspaceMember } from "../middleware/workspace.middleware.js";
import { getWorkspaceDashboardData } from "../controllers/dashboard.controller.js";

const router = express.Router({ mergeParams: true });

router.get("/", requireAuth, requireWorkspaceMember, getWorkspaceDashboardData);

export default router;
