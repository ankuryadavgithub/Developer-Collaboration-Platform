import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Validates that the logged-in user belongs to the requested organization,
 * and optionally checks if they have a sufficient role.
 */
const checkOrganizationRole = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      // The org ID usually comes from the URL (e.g. /api/organizations/:orgId/...)
      // But we also check the body just in case (e.g. creating an invite)
      const organizationId = parseInt(
        req.params.orgId || req.body.organizationId,
      );

      if (!organizationId) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Organization ID is required in the request.",
          });
      }

      // Query the database to guarantee this user is a member of this specific organization
      const membership = await prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId,
            userId: req.user.id, // req.user comes from your existing requireAuth middleware
          },
        },
      });

      if (!membership) {
        return res
          .status(403)
          .json({
            success: false,
            message: "Forbidden: You are not a member of this organization.",
          });
      }

      // If specific roles are required, check them
      if (allowedRoles.length > 0 && !allowedRoles.includes(membership.role)) {
        return res.status(403).json({
          success: false,
          message: `Forbidden: Your organization role (${membership.role}) does not have permission to perform this action.`,
        });
      }

      // Attach the verified orgRole to the request for controllers to use
      req.orgRole = membership.role;
      next();
    } catch (error) {
      console.error("Organization Middleware Error:", error);
      res
        .status(500)
        .json({
          success: false,
          message: "Internal server error during authorization.",
        });
    }
  };
};

// Export the ready-to-use middlewares
export const requireOrgMember = checkOrganizationRole(); // Any member
export const requireOrgManager = checkOrganizationRole([
  "OWNER",
  "ADMIN",
  "MANAGER",
]);
export const requireOrgAdmin = checkOrganizationRole(["OWNER", "ADMIN"]);
export const requireOrgOwner = checkOrganizationRole(["OWNER"]);
