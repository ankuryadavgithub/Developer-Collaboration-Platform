import express from "express";
import { 
  getUsers, getUserById, updateUserRole, deleteUser,
  getOrganizations, getOrganizationById, deleteOrganization,
  getWorkspaces
} from "../controllers/admin.controller.js";
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
router.get("/users/:id", getUserById);
router.patch("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);

// GET /api/admin/organizations
router.get("/organizations", getOrganizations);
router.get("/organizations/:id", getOrganizationById);
router.delete("/organizations/:id", deleteOrganization);

// GET /api/admin/workspaces
router.get("/workspaces", getWorkspaces);

export default router;
