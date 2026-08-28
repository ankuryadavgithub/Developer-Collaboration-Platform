import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Validates that the requested workspace belongs to the requested organization.
 * Then validates that the logged-in user is a member of that workspace
 * (or is an Organization Admin/Owner).
 */
export const checkWorkspaceRole = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      const orgId = parseInt(req.params.orgId);
      const workspaceId = parseInt(req.params.workspaceId);

      if (!orgId || !workspaceId) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Organization ID and Workspace ID are required.",
          });
      }

      // 1. Enforce Strict Data Isolation: Does this workspace actually belong to this Org?
      const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
      });

      if (!workspace || workspace.organizationId !== orgId) {
        return res
          .status(404)
          .json({
            success: false,
            message: "Workspace not found in this organization.",
          });
      }

      // 2. Check if the user is an Organization OWNER or ADMIN.
      // (Org Owners/Admins get implicit "Super Admin" access to all workspaces inside their org)
      const orgMembership = await prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: { organizationId: orgId, userId: req.user.id },
        },
      });

      if (!orgMembership) {
        return res
          .status(403)
          .json({
            success: false,
            message: "You are not a member of this organization.",
          });
      }

      const isOrgAdmin = ["OWNER", "ADMIN"].includes(orgMembership.role);

      // 3. Check Workspace Membership
      const workspaceMembership = await prisma.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId, userId: req.user.id } },
      });

      // If they aren't a workspace member AND they aren't an Org Admin, deny access entirely.
      if (!workspaceMembership && !isOrgAdmin) {
        return res
          .status(403)
          .json({
            success: false,
            message: "Forbidden: You do not have access to this workspace.",
          });
      }

      // If they are an Org Admin, they implicitly act as a WORKSPACE_ADMIN.
      const userWorkspaceRole = workspaceMembership
        ? workspaceMembership.role
        : "WORKSPACE_ADMIN";

      // 4. Role check for specific actions
      if (
        allowedRoles.length > 0 &&
        !isOrgAdmin &&
        !allowedRoles.includes(userWorkspaceRole)
      ) {
        return res.status(403).json({
          success: false,
          message: `Forbidden: Your workspace role (${userWorkspaceRole}) does not have permission for this action.`,
        });
      }

      // Attach context to the request for the controllers to use!
      req.workspaceRole = userWorkspaceRole;
      req.workspace = workspace;
      next();
    } catch (error) {
      console.error("Workspace Middleware Error:", error);
      return res
        .status(500)
        .json({
          success: false,
          message: "Internal server error during workspace authorization.",
        });
    }
  };
};

export const requireWorkspaceMember = checkWorkspaceRole();
export const requireWorkspaceManager = checkWorkspaceRole(["WORKSPACE_ADMIN", "CONTRIBUTOR"]);
export const requireWorkspaceAdmin = checkWorkspaceRole(["WORKSPACE_ADMIN"]);
