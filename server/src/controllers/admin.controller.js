import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// @desc    Get all users (with pagination & search)
// @route   GET /api/admin/users
// @access  Private/PlatformAdmin
export const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const searchQuery = req.query.search || "";

    const whereClause = {
      OR: [
        { username: { contains: searchQuery, mode: "insensitive" } },
        { email: { contains: searchQuery, mode: "insensitive" } },
      ],
    };

    const [users, totalUsers] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          username: true,
          email: true,
          platformRole: true, // Returning the new role
          avatar: true,
          createdAt: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: {
        users,
        pagination: {
          totalUsers,
          currentPage: page,
          totalPages: Math.ceil(totalUsers / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error in getUsers:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// @desc    Get all organizations (with pagination & search)
// @route   GET /api/admin/organizations
// @access  Private/PlatformAdmin
export const getOrganizations = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const searchQuery = req.query.search || "";

    const whereClause = {
      name: { contains: searchQuery, mode: "insensitive" },
    };

    const [organizations, totalOrgs] = await Promise.all([
      prisma.organization.findMany({
        where: whereClause,
        include: {
          _count: {
            select: { members: true },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.organization.count({ where: whereClause }),
    ]);

    return res.status(200).json({
      success: true,
      message: "Organizations fetched successfully",
      data: {
        organizations,
        pagination: {
          totalOrganizations: totalOrgs,
          currentPage: page,
          totalPages: Math.ceil(totalOrgs / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error in getOrganizations:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// @desc    Get user by ID with organizations and workspaces
// @route   GET /api/admin/users/:id
// @access  Private/PlatformAdmin
export const getUserById = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        platformRole: true,
        avatar: true,
        createdAt: true,
        organizationMemberships: {
          include: {
            organization: true
          }
        },
        workspaceMemberships: {
          include: {
            workspace: {
              include: {
                organization: true
              }
            }
          }
        }
      }
    });
    
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error("Error in getUserById:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// @desc    Update user platform role
// @route   PATCH /api/admin/users/:id/role
// @access  Private/PlatformAdmin
export const updateUserRole = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { role } = req.body;
    
    if (role !== "USER" && role !== "PLATFORM_ADMIN") {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }
    
    if (role === "USER") {
      const adminCount = await prisma.user.count({ where: { platformRole: "PLATFORM_ADMIN" } });
      if (adminCount <= 1) {
        const target = await prisma.user.findUnique({ where: { id: userId }});
        if (target && target.platformRole === "PLATFORM_ADMIN") {
          return res.status(400).json({ success: false, message: "Cannot remove the last platform admin" });
        }
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { platformRole: role },
      select: { id: true, username: true, platformRole: true }
    });
    
    return res.status(200).json({ success: true, message: "User role updated successfully", data: updatedUser });
  } catch (error) {
    console.error("Error in updateUserRole:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/PlatformAdmin
export const deleteUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (userId === req.user.id) {
      return res.status(400).json({ success: false, message: "Cannot delete your own account" });
    }

    await prisma.user.delete({ where: { id: userId } });
    return res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error in deleteUser:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// @desc    Get organization by ID with members and workspaces
// @route   GET /api/admin/organizations/:id
// @access  Private/PlatformAdmin
export const getOrganizationById = async (req, res) => {
  try {
    const orgId = parseInt(req.params.id);
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, username: true, email: true, avatar: true, platformRole: true }
            }
          }
        },
        workspaces: true,
        _count: {
          select: { members: true, workspaces: true }
        }
      }
    });
    
    if (!org) return res.status(404).json({ success: false, message: "Organization not found" });
    
    return res.status(200).json({ success: true, data: org });
  } catch (error) {
    console.error("Error in getOrganizationById:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// @desc    Delete organization
// @route   DELETE /api/admin/organizations/:id
// @access  Private/PlatformAdmin
export const deleteOrganization = async (req, res) => {
  try {
    const orgId = parseInt(req.params.id);
    await prisma.organization.delete({ where: { id: orgId } });
    return res.status(200).json({ success: true, message: "Organization deleted successfully" });
  } catch (error) {
    console.error("Error in deleteOrganization:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// @desc    Get all workspaces
// @route   GET /api/admin/workspaces
// @access  Private/PlatformAdmin
export const getWorkspaces = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const searchQuery = req.query.search || "";

    const whereClause = {
      name: { contains: searchQuery, mode: "insensitive" },
    };

    const [workspaces, totalWorkspaces] = await Promise.all([
      prisma.workspace.findMany({
        where: whereClause,
        include: {
          organization: { select: { id: true, name: true } },
          createdBy: { select: { id: true, username: true } },
          _count: {
            select: { members: true },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.workspace.count({ where: whereClause }),
    ]);

    return res.status(200).json({
      success: true,
      message: "Workspaces fetched successfully",
      data: {
        workspaces,
        pagination: {
          totalWorkspaces,
          currentPage: page,
          totalPages: Math.ceil(totalWorkspaces / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error in getWorkspaces:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
