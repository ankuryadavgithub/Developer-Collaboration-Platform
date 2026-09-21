import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireWorkspaceMember } from "../middleware/workspace.middleware.js";
import {
  createTask,
  getTasks,
  updateTask,
} from "../controllers/task.controller.js";

const router = express.Router({ mergeParams: true });

// Members (including contributors/admins) can manage tasks
router.get("/", requireAuth, requireWorkspaceMember, getTasks);
router.post("/", requireAuth, requireWorkspaceMember, createTask);
router.patch("/:taskId", requireAuth, requireWorkspaceMember, updateTask);

export default router;
