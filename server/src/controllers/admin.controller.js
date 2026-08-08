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
