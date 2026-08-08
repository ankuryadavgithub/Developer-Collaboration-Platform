import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// @desc    Get all members of a workspace
// @route   GET /api/organizations/:orgId/workspaces/:workspaceId/members
export const getWorkspaceMembers = async (req, res) => {
  try {
    const workspaceId = req.workspace.id; // safely pulled from requireWorkspaceMember middleware

    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
            jobTitle: true,
          },
        },
      },
    });

    return res.status(200).json({ success: true, data: members });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch workspace members." });
  }
};

// @desc    Get organization members who are NOT in the workspace yet
// @route   GET /api/organizations/:orgId/workspaces/:workspaceId/members/available
export const getAvailableOrgMembers = async (req, res) => {
  try {
    const orgId = parseInt(req.params.orgId);
    const workspaceId = req.workspace.id;

    // Strict Rule Enforcement: Only find users who belong to the Org,
    // BUT whose userId does NOT exist in this specific Workspace's member list
    const availableMembers = await prisma.organizationMember.findMany({
      where: {
        organizationId: orgId,
        user: {
          workspaceMembers: {
            none: { workspaceId: workspaceId },
          },
        },
      },
      include: {
        user: {
          select: { id: true, username: true, email: true, avatar: true },
        },
      },
    });

    return res.status(200).json({ success: true, data: availableMembers });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch available organization members.",
      });
  }
};

// @desc    Add an organization member to the workspace
// @route   POST /api/organizations/:orgId/workspaces/:workspaceId/members
export const addWorkspaceMember = async (req, res) => {
  try {
    const orgId = parseInt(req.params.orgId);
    const workspaceId = req.workspace.id;
    const { userId, role } = req.body;

    if (!userId)
      return res
        .status(400)
        .json({ success: false, message: "User ID is required." });

    // Double-check they are actually in the Organization
    const orgMember = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: orgId,
          userId: parseInt(userId),
        },
      },
    });

    if (!orgMember)
      return res
        .status(403)
        .json({
          success: false,
          message:
            "User must be a member of the organization before joining a workspace.",
        });

    // Ensure they aren't already in the Workspace
    const existing = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: parseInt(userId) } },
    });

    if (existing)
      return res
        .status(400)
        .json({
          success: false,
          message: "User is already in this workspace.",
        });

    const newMember = await prisma.workspaceMember.create({
      data: {
        workspaceId,
        userId: parseInt(userId),
        role: role || "VIEWER",
      },
    });

    return res
      .status(201)
      .json({
        success: true,
        message: "Member added to workspace successfully.",
        data: newMember,
      });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to add member to workspace." });
  }
};

// @desc    Remove a workspace member
// @route   DELETE /api/organizations/:orgId/workspaces/:workspaceId/members/:userId
export const removeWorkspaceMember = async (req, res) => {
  try {
    const workspaceId = req.workspace.id;
    const targetUserId = parseInt(req.params.userId);

    // Prevent deleting the workspace creator/yourself if needed, or just let Org Admins handle it
    if (targetUserId === req.workspace.createdById) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Cannot remove the workspace creator.",
        });
    }

    await prisma.workspaceMember.delete({
      where: { workspaceId_userId: { workspaceId, userId: targetUserId } },
    });

    return res
      .status(200)
      .json({ success: true, message: "Workspace member removed." });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to remove member." });
  }
};
