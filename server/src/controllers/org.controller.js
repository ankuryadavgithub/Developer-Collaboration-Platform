import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// @desc    Create a new organization
// @route   POST /api/organizations
export const createOrganization = async (req, res) => {
  const { name, description } = req.body;

  if (!name || typeof name !== "string") {
    return res.status(400).json({ success: false, message: "A valid organization name is required." });
  }

  const trimmedName = name.trim();
  if (trimmedName.length === 0) {
    return res.status(400).json({ success: false, message: "Organization name cannot be empty." });
  }

  if (trimmedName.length > 100) {
    return res.status(400).json({ success: false, message: "Organization name must be 100 characters or less." });
  }

  let trimmedDescription = null;
  if (description) {
    if (typeof description !== "string") {
      return res.status(400).json({ success: false, message: "Description must be a string." });
    }
    trimmedDescription = description.trim();
    if (trimmedDescription.length > 1000) {
      return res.status(400).json({ success: false, message: "Description must be 1000 characters or less." });
    }
  }

  try {
    // Quota check: Limit to 5 organizations per user
    const ownedOrgsCount = await prisma.organization.count({
      where: { ownerId: req.user.id }
    });

    if (ownedOrgsCount >= 5) {
      return res.status(403).json({ success: false, message: "You have reached the maximum limit of 5 organizations." });
    }

    // We use a transaction because the Org and the Member record must be created together safely
    const newOrg = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: trimmedName,
          description: trimmedDescription,
          ownerId: req.user.id,
        },
      });

      await tx.organizationMember.create({
        data: {
          organizationId: org.id,
          userId: req.user.id,
          role: "OWNER",
        },
      });

      return org;
    });

    return res
      .status(201)
      .json({ success: true, message: "Organization created", data: newOrg });
  } catch (error) {
    console.error("Create Org Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// @desc    Get all organizations the user belongs to
// @route   GET /api/organizations/mine
export const getMyOrganizations = async (req, res) => {
  try {
    const memberships = await prisma.organizationMember.findMany({
      where: { userId: req.user.id },
      include: { organization: true },
    });

    // Extract the org details and append the user's specific role for that org
    const orgs = memberships.map((m) => ({
      ...m.organization,
      myRole: m.role,
    }));

    return res.status(200).json({ success: true, data: orgs });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// @desc    Get specific organization details
// @route   GET /api/organizations/:orgId
export const getOrganizationById = async (req, res) => {
  try {
    const orgId = parseInt(req.params.orgId);
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      include: { _count: { select: { members: true } } },
    });

    if (!org)
      return res
        .status(404)
        .json({ success: false, message: "Organization not found" });

    return res.status(200).json({
      success: true,
      data: {
        ...org,
        myRole: req.orgRole, // Injected securely by our org.middleware.js!
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// @desc    Update organization basic details
// @route   PATCH /api/organizations/:orgId
export const updateOrganization = async (req, res) => {
  try {
    const orgId = parseInt(req.params.orgId);
    let { name, description } = req.body;

    if (!name || typeof name !== "string") {
      return res.status(400).json({ success: false, message: "A valid organization name is required." });
    }

    name = name.trim();
    if (name.length === 0) {
      return res.status(400).json({ success: false, message: "Organization name cannot be empty." });
    }
    if (name.length > 100) {
      return res.status(400).json({ success: false, message: "Organization name must be 100 characters or less." });
    }

    let trimmedDescription = null;
    if (description) {
      if (typeof description !== "string") {
        return res.status(400).json({ success: false, message: "Description must be a string." });
      }
      trimmedDescription = description.trim();
      if (trimmedDescription.length > 1000) {
        return res.status(400).json({ success: false, message: "Description must be 1000 characters or less." });
      }
    }

    const updatedOrg = await prisma.organization.update({
      where: { id: orgId },
      data: { name, description: trimmedDescription },
    });

    return res
      .status(200)
      .json({
        success: true,
        message: "Organization updated",
        data: updatedOrg,
      });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// @desc    Get organization members
// @route   GET /api/organizations/:orgId/members
export const getOrganizationMembers = async (req, res) => {
  try {
    const orgId = parseInt(req.params.orgId);
    const members = await prisma.organizationMember.findMany({
      where: { organizationId: orgId },
      include: {
        user: { select: { id: true, username: true, email: true, avatar: true, jobTitle: true } }
      }
    });
    return res.status(200).json({ success: true, data: members });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// @desc    Update a member's role
// @route   PATCH /api/organizations/:orgId/members/:memberId/role
export const updateMemberRole = async (req, res) => {
  try {
    const orgId = parseInt(req.params.orgId);
    const memberId = parseInt(req.params.memberId); // This is the OrganizationMember.id
    
    if (isNaN(memberId)) {
      return res.status(400).json({ success: false, message: "Invalid Member ID." });
    }

    const { newRole } = req.body;
    
    if (typeof newRole !== "string" || !["ADMIN", "MANAGER", "MEMBER"].includes(newRole)) {
      return res.status(400).json({ success: false, message: "A valid new role is required." });
    }
    
    // Only OWNER or ADMIN can hit this endpoint (enforced by our middleware)
    const myRole = req.orgRole;

    if (newRole === "OWNER") return res.status(403).json({ success: false, message: "Cannot assign OWNER role directly. Use transfer ownership." });

    const targetMember = await prisma.organizationMember.findUnique({ where: { id: memberId } });
    if (!targetMember || targetMember.organizationId !== orgId) return res.status(404).json({ success: false, message: "Member not found." });
    if (targetMember.role === "OWNER") return res.status(403).json({ success: false, message: "Cannot change the role of the organization owner." });
    
    // Admin matrix checks
    if (myRole === "ADMIN" && newRole === "ADMIN") return res.status(403).json({ success: false, message: "Admins cannot promote others to Admin." });
    if (myRole === "ADMIN" && targetMember.role === "ADMIN") return res.status(403).json({ success: false, message: "Admins cannot change the role of other Admins." });

    const updatedMember = await prisma.organizationMember.update({
      where: { id: memberId },
      data: { role: newRole }
    });
    return res.status(200).json({ success: true, message: "Role updated", data: updatedMember });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// @desc    Remove a member
// @route   DELETE /api/organizations/:orgId/members/:memberId
export const removeMember = async (req, res) => {
  try {
    const orgId = parseInt(req.params.orgId);
    const memberId = parseInt(req.params.memberId); 
    
    if (isNaN(memberId)) {
      return res.status(400).json({ success: false, message: "Invalid Member ID." });
    }

    const myRole = req.orgRole;

    const targetMember = await prisma.organizationMember.findUnique({ where: { id: memberId } });
    if (!targetMember || targetMember.organizationId !== orgId) return res.status(404).json({ success: false, message: "Member not found." });
    if (targetMember.role === "OWNER") return res.status(403).json({ success: false, message: "Cannot remove the organization owner. Transfer ownership first." });
    if (myRole === "ADMIN" && targetMember.role === "ADMIN") return res.status(403).json({ success: false, message: "Admins cannot remove other Admins." });

    await prisma.organizationMember.delete({ where: { id: memberId } });
    return res.status(200).json({ success: true, message: "Member removed" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// @desc    Transfer ownership (Database Transaction)
// @route   POST /api/organizations/:orgId/transfer-ownership
export const transferOwnership = async (req, res) => {
  try {
    const orgId = parseInt(req.params.orgId);
    const { newOwnerUserId } = req.body;
    
    if (typeof newOwnerUserId !== "number") {
      return res.status(400).json({ success: false, message: "A valid numeric newOwnerUserId is required." });
    }
    
    // myRole is strictly OWNER (enforced by middleware)
    if (newOwnerUserId === req.user.id) return res.status(400).json({ success: false, message: "You are already the owner." });

    await prisma.$transaction(async (tx) => {
      // 1. Verify target is a member
      const newOwnerMember = await tx.organizationMember.findUnique({
        where: { organizationId_userId: { organizationId: orgId, userId: newOwnerUserId } }
      });
      if (!newOwnerMember) throw new Error("Target user is not a member of the organization.");

      // 2. Demote current owner to ADMIN
      await tx.organizationMember.update({
        where: { organizationId_userId: { organizationId: orgId, userId: req.user.id } },
        data: { role: "ADMIN" }
      });

      // 3. Promote new owner
      await tx.organizationMember.update({
        where: { id: newOwnerMember.id },
        data: { role: "OWNER" }
      });

      // 4. Update the actual Organization ownerId field
      await tx.organization.update({
        where: { id: orgId },
        data: { ownerId: newOwnerUserId }
      });
    });

    return res.status(200).json({ success: true, message: "Ownership transferred successfully." });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || "Failed to transfer ownership" });
  }
};