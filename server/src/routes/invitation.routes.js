import express from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireOrgAdmin } from "../middleware/org.middleware.js";
import {
  searchUsersToInvite,
  createInvitation,
  getMyInvitations,
  acceptInvitation,
  rejectInvitation,
} from "../controllers/invitation.controller.js";

const router = express.Router();

router.use(requireAuth);

// Routes for the organization ADMIN/OWNER to invite people
// Notice requireOrgAdmin ensures they can't invite people to an org they don't own!
router.get("/org/:orgId/search", requireOrgAdmin, searchUsersToInvite);
router.post("/org/:orgId", requireOrgAdmin, createInvitation);

// Routes for the individual user to manage their own inbox
router.get("/mine", getMyInvitations);
router.patch("/:invitationId/accept", acceptInvitation);
router.patch("/:invitationId/reject", rejectInvitation);

export default router;
