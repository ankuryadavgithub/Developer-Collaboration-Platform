import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireOrgAdmin } from "../middleware/org.middleware.js";
import {
  searchUsersToInvite,
  createInvitation,
  getMyInvitations,
  acceptInvitation,
  rejectInvitation,
  getOrgInvitations,
  cancelInvitation
} from "../controllers/invitation.controller.js";

const router = express.Router();

router.use(requireAuth);

// Routes for the organization ADMIN/OWNER to manage invites
router.get("/org/:orgId/search", requireOrgAdmin, searchUsersToInvite);
router.post("/org/:orgId", requireOrgAdmin, createInvitation);
router.get("/org/:orgId", requireOrgAdmin, getOrgInvitations); // Task 2: Admin View
router.delete("/org/:orgId/:invitationId", requireOrgAdmin, cancelInvitation); // Task 3: Cancel Route

// Routes for the individual user to manage their own inbox
router.get("/mine", getMyInvitations);
router.patch("/:invitationId/accept", acceptInvitation);
router.patch("/:invitationId/reject", rejectInvitation);

export default router;