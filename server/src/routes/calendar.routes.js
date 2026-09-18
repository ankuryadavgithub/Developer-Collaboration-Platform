import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireWorkspaceMember } from "../middleware/workspace.middleware.js";
import {
  getWorkspaceCalendar,
  getCalendarToken,
} from "../controllers/calendar.controller.js";

const router = express.Router({ mergeParams: true });

router.get("/", requireAuth, requireWorkspaceMember, getWorkspaceCalendar);
router.get("/token", requireAuth, requireWorkspaceMember, getCalendarToken);

export default router;
