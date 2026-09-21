import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  requireOrgMember,
  requireOrgAdmin,
  requireOrgOwner,
} from "../middleware/org.middleware.js";
import {
  createOrganization,
  getMyOrganizations,
  getOrganizationById,
  updateOrganization,
  getOrganizationMembers,
  updateMemberRole,
  removeMember,
  transferOwnership,
} from "../controllers/org.controller.js";

const router = express.Router();

// User must be globally authenticated
router.use(requireAuth);

router.post("/", createOrganization);
router.get("/mine", getMyOrganizations);

// User MUST be a verified member of the specific :orgId
router.get("/:orgId", requireOrgMember, getOrganizationById);
// User MUST be an ADMIN or OWNER of the specific :orgId
router.patch("/:orgId", requireOrgAdmin, updateOrganization);

// Member management
router.get("/:orgId/members", requireOrgMember, getOrganizationMembers);
router.patch("/:orgId/members/:memberId/role", requireOrgAdmin, updateMemberRole);
router.delete("/:orgId/members/:memberId", requireOrgAdmin, removeMember);
router.post("/:orgId/transfer-ownership", requireOrgOwner, transferOwnership);

export default router;
