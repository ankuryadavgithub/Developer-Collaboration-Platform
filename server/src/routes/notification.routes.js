// server/src/routes/notification.routes.js

import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from "../controllers/notification.controller.js";

const router = express.Router();

// Require user to be logged in for all routes
router.use(requireAuth);

router.get("/", getNotifications);
router.get("/unread-count", getUnreadCount);
// Note: /read-all must come before /:id/read so Express doesn't think "read-all" is an ID!
router.patch("/read-all", markAllAsRead); 
router.patch("/:id/read", markAsRead);

export default router;