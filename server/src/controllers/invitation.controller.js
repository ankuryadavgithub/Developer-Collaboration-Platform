import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// @desc    Search for DevHub users to invite (excludes existing members & pending invites)
// @route   GET /api/invitations/org/:orgId/search
export const searchUsersToInvite = async (req, res) => {
  try {
    const orgId = parseInt(req.params.orgId);
    const searchQuery = req.query.search || "";

    if (searchQuery.length < 3) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Search query must be at least 3 characters.",
        });
    }

    // Find users matching search, who are NOT already members, and do NOT have a PENDING invite
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: searchQuery, mode: "insensitive" } },
          { email: { contains: searchQuery, mode: "insensitive" } },
        ],
        NOT: {
          OR: [
            { organizationMembers: { some: { organizationId: orgId } } },
            {
              invitationsReceived: {
                some: { organizationId: orgId, status: "PENDING" },
              },
            },
          ],
        },
      },
      select: { id: true, username: true, email: true, avatar: true },
      take: 10,
    });

    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// @desc    Invite a user to the organization
// @route   POST /api/invitations/org/:orgId
export const createInvitation = async (req, res) => {
  try {
    const orgId = parseInt(req.params.orgId);
    const { userId } = req.body;

    if (!userId)
      return res
        .status(400)
        .json({ success: false, message: "User ID is required." });

    const existingMember = await prisma.organizationMember.findUnique({
      where: { organizationId_userId: { organizationId: orgId, userId } },
    });
    if (existingMember)
      return res
        .status(409)
        .json({ success: false, message: "User is already a member." });

    const pendingInvite = await prisma.invitation.findFirst({
      where: {
        organizationId: orgId,
        invitedUserId: userId,
        status: "PENDING",
      },
    });
    if (pendingInvite)
      return res
        .status(409)
        .json({
          success: false,
          message: "User already has a pending invitation.",
        });

    // Expires in 7 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await prisma.invitation.create({
      data: {
        organizationId: orgId,
        invitedUserId: userId,
        invitedById: req.user.id,
        role: "MEMBER", // Default to MEMBER as per your spec
        expiresAt,
      },
    });

    return res
      .status(201)
      .json({ success: true, message: "Invitation sent successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// @desc    Get all pending invitations for the logged-in user
// @route   GET /api/invitations/mine
export const getMyInvitations = async (req, res) => {
  try {
    const invitations = await prisma.invitation.findMany({
      where: { invitedUserId: req.user.id, status: "PENDING" },
      include: {
        organization: { select: { id: true, name: true, description: true } },
        invitedBy: { select: { username: true, email: true, avatar: true } },
      },
    });
    return res.status(200).json({ success: true, data: invitations });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// @desc    Accept an invitation
// @route   PATCH /api/invitations/:invitationId/accept
export const acceptInvitation = async (req, res) => {
  try {
    const invitationId = parseInt(req.params.invitationId);

    // Use a transaction! If adding the member fails, the invite won't be marked accepted.
    await prisma.$transaction(async (tx) => {
      const invite = await tx.invitation.findUnique({
        where: { id: invitationId },
      });

      if (
        !invite ||
        invite.invitedUserId !== req.user.id ||
        invite.status !== "PENDING"
      ) {
        throw new Error("Invalid or expired invitation");
      }

      await tx.invitation.update({
        where: { id: invitationId },
        data: { status: "ACCEPTED" },
      });

      await tx.organizationMember.create({
        data: {
          organizationId: invite.organizationId,
          userId: req.user.id,
          role: invite.role,
        },
      });
    });

    return res
      .status(200)
      .json({ success: true, message: "Invitation accepted!" });
  } catch (error) {
    return res
      .status(400)
      .json({
        success: false,
        message: error.message || "Failed to accept invitation",
      });
  }
};

// @desc    Reject an invitation
// @route   PATCH /api/invitations/:invitationId/reject
export const rejectInvitation = async (req, res) => {
  try {
    const invitationId = parseInt(req.params.invitationId);

    const invite = await prisma.invitation.findUnique({
      where: { id: invitationId },
    });
    if (
      !invite ||
      invite.invitedUserId !== req.user.id ||
      invite.status !== "PENDING"
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid invitation" });
    }

    await prisma.invitation.update({
      where: { id: invitationId },
      data: { status: "REJECTED" },
    });

    return res
      .status(200)
      .json({ success: true, message: "Invitation rejected" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
