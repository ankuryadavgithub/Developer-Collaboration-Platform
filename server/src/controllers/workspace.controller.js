import { PrismaClient } from "@prisma/client";
import { getGithubToken, githubHeaders } from "./github.controller.js";

const prisma = new PrismaClient();

// @desc    Create a new workspace inside an organization
// @route   POST /api/organizations/:orgId/workspaces
export const createWorkspace = async (req, res) => {
  try {
    const orgId = parseInt(req.params.orgId);
    const {
      name,
      description,
      repositoryOption,
      repositoryName,
      repositoryDescription,
      isPrivate,
      existingRepo,
    } = req.body;

    if (!name || !repositoryOption) {
      return res.status(400).json({
        success: false,
        message: "Workspace name and repository option are required.",
      });
    }

    const existingWorkspace = await prisma.workspace.findFirst({
      where: {
        organizationId: orgId,
        name: name,
      },
    });

    if (existingWorkspace) {
      return res.status(409).json({
        success: false,
        message:
          "A workspace with this name already exists in the organization.",
      });
    }

    let repoData = null;

    // --- STEP 1: External GitHub API Operations ---
    if (repositoryOption === "CREATE_NEW") {
      const githubToken = await getGithubToken(req, res);
      if (!githubToken) return; // getGithubToken handles the error response

      if (!repositoryName)
        return res
          .status(400)
          .json({ success: false, message: "Repository name is required." });

      const response = await fetch("https://api.github.com/user/repos", {
        method: "POST",
        headers: githubHeaders(githubToken),
        body: JSON.stringify({
          name: repositoryName,
          description: repositoryDescription,
          private: isPrivate,
          auto_init: true, // Always init with a README
        }),
      });

      const newRepo = await response.json();
      if (!response.ok)
        return res.status(response.status).json({
          success: false,
          message: newRepo.message || "Failed to create GitHub repository.",
        });

      repoData = {
        githubRepositoryId: newRepo.id.toString(), // Enforce String to prevent ID overflow
        name: newRepo.name,
        fullName: newRepo.full_name,
        owner: newRepo.owner.login,
        description: newRepo.description,
        visibility: newRepo.visibility,
        defaultBranch: newRepo.default_branch,
        htmlUrl: newRepo.html_url,
      };
    } else if (repositoryOption === "CONNECT_EXISTING") {
      if (!existingRepo || !existingRepo.id)
        return res.status(400).json({
          success: false,
          message: "Existing repository selection is invalid.",
        });

      // Ensure it's not already connected to a different workspace (1-to-1 enforcement)
      const existingDbRepo = await prisma.repository.findUnique({
        where: { githubRepositoryId: existingRepo.id.toString() },
      });

      if (existingDbRepo)
        return res.status(400).json({
          success: false,
          message:
            "This GitHub repository is already connected to another workspace.",
        });

      repoData = {
        githubRepositoryId: existingRepo.id.toString(),
        name: existingRepo.name,
        fullName: existingRepo.fullName,
        owner: existingRepo.owner,
        description: existingRepo.description,
        visibility: existingRepo.visibility,
        defaultBranch: existingRepo.defaultBranch,
        htmlUrl: existingRepo.htmlUrl,
      };
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid repository option." });
    }

    // --- STEP 2: Database Transaction ---
    const newWorkspace = await prisma.$transaction(async (tx) => {
      // 1. Create Workspace
      const workspace = await tx.workspace.create({
        data: {
          organizationId: orgId,
          name,
          description,
          createdById: req.user.id,
        },
      });

      // 2. Attach Repository
      await tx.repository.create({
        data: {
          workspaceId: workspace.id,
          ...repoData,
        },
      });

      // 3. Make Creator an Admin of the Workspace
      await tx.workspaceMember.create({
        data: {
          workspaceId: workspace.id,
          userId: req.user.id,
          role: "WORKSPACE_ADMIN",
        },
      });

      return workspace;
    });

    return res.status(201).json({
      success: true,
      message: "Workspace created successfully",
      data: newWorkspace,
    });
  } catch (error) {
    console.error("Create workspace error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during workspace creation.",
    });
  }
};

// @desc    Get all workspaces for the organization that the user can see
// @route   GET /api/organizations/:orgId/workspaces
export const getWorkspaces = async (req, res) => {
  try {
    const orgId = parseInt(req.params.orgId);
    const orgRole = req.orgRole; // Attached by requireOrgMember middleware

    let whereClause = { organizationId: orgId };

    // Organization Admins and Owners can see ALL workspaces.
    // Managers and Members can only see workspaces they are explicitly added to.
    if (orgRole !== "OWNER" && orgRole !== "ADMIN") {
      whereClause.members = {
        some: { userId: req.user.id },
      };
    }

    const workspaces = await prisma.workspace.findMany({
      where: whereClause,
      include: {
        repository: true,
        createdBy: { select: { username: true, avatar: true } },
        _count: { select: { members: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ success: true, data: workspaces });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch workspaces" });
  }
};

// @desc    Get specific workspace details
// @route   GET /api/organizations/:orgId/workspaces/:workspaceId
export const getWorkspaceDetails = async (req, res) => {
  try {
    // req.workspace is safely populated by the requireWorkspaceMember middleware!
    const workspaceId = req.workspace.id;

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        repository: true,
        createdBy: { select: { username: true, avatar: true } },
      },
    });

    return res.status(200).json({ success: true, data: workspace });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch workspace details" });
  }
};

// @desc    Archive Workspace
// @route   PATCH /api/organizations/:orgId/workspaces/:workspaceId/archive
export const archiveWorkspace = async (req, res) => {
  try {
    const workspaceId = req.workspace.id;

    const archived = await prisma.workspace.update({
      where: { id: workspaceId },
      data: { status: "ARCHIVED" },
    });

    return res.status(200).json({
      success: true,
      message: "Workspace archived successfully",
      data: archived,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to archive workspace" });
  }
};

// update workspace name and description
export const updateWorkspace = async (req, res) => {
  try {
    let { name, description } = req.body;
    const workspaceId = req.workspace.id;
    const orgId = req.workspace.organizationId;
    const oldName = req.workspace.name; // to show in notification

    if (!name || name.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "Workspace name is required." });
    }

    name = name.trim();
    description = description ? description.trim() : "";

    // Uniqueness check: Does another workspace in this org have this name?
    const existingWorkspace = await prisma.workspace.findFirst({
      where: {
        organizationId: orgId,
        name: name,
        id: { not: workspaceId }, // Exclude the current workspace
      },
    });

    if (existingWorkspace) {
      return res.status(409).json({
        success: false,
        message: "A workspace with this name already exists in the organization.",
      });
    }

    const updatedWorkspace = await prisma.workspace.update({
      where: { id: workspaceId },
      data: { name, description },
    });

    // Notify organization members about the update (except the user who updated it)
    const orgMembers = await prisma.organizationMember.findMany({
      where: {
        organizationId: orgId,
        userId: { not: req.user.id }
      },
      select: { userId: true }
    });

    if (orgMembers.length > 0) {
      const notifications = orgMembers.map(member => ({
        userId: member.userId,
        type: "SYSTEM",
        title: "Workspace Updated",
        message: `${req.user.username || 'A team member'} updated the workspace settings for '${name}'.`,
        metadata: { workspaceId, orgId }
      }));

      await prisma.notification.createMany({
        data: notifications
      });
    }

    return res
      .status(200)
      .json({
        success: true,
        data: updatedWorkspace,
        message: "Workspace updated successfully.",
      });
  } catch (error) {
    console.error("Update workspace error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update workspace." });
  }
};