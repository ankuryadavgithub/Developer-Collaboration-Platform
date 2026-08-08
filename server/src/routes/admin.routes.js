import express from "express";
import { getUsers, getOrganizations } from "../controllers/admin.controller.js";
import {
  requireAuth,
  requirePlatformAdmin,
} from "../middleware/auth.middleware.js";

const router = express.Router();

// Apply middlewares to ALL routes in this file
// 1. Must be logged in (requireAuth)
// 2. Must be a PLATFORM_ADMIN (requirePlatformAdmin)
router.use(requireAuth);
router.use(requirePlatformAdmin);

// GET /api/admin/users
router.get("/users", getUsers);

// GET /api/admin/organizations
router.get("/organizations", getOrganizations);

export default router;
