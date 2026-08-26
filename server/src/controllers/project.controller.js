import { PrismaClient } from "@prisma/client";
import { logActivity } from "../utils/activityLogger.js";

const prisma = new PrismaClient();

// Helper to calculate progress based on tasks
const calculateProgress = (tasks) => {
  if (!tasks || tasks.length === 0) return 0;
  const completed = tasks.filter((t) => t.status === "DONE").length;
  return Math.round((completed / tasks.length) * 100);
};

// @desc    Create a new project
// @route   POST /api/organizations/:orgId/workspaces/:workspaceId/projects
export const createProject = async (req, res) => {
  try {
    const workspaceId = req.workspace.id; // From workspace.middleware
    const { name, description } = req.body;

    if (!name)
      return res
        .status(400)
        .json({ success: false, message: "Project name is required" });

    const existing = await prisma.project.findUnique({
      where: { workspaceId_name: { workspaceId, name } },
    });

    if (existing)
      return res
        .status(400)
        .json({
          success: false,
          message: "A project with this name already exists in this workspace.",
        });

    let githubProjectId = null;

    // BUG 3 FIX: Use the Workspace Owner's token so any team member can sync!
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { owner: true }
    });
    
    if (workspace?.owner?.githubAccessToken) {
      const syncToken = workspace.owner.githubAccessToken;
      const repository = await prisma.repository.findUnique({
        where: { workspaceId },
      });
      if (repository) {
        try {
          const { getGithubRepoDetails, createGithubProject } = await import("../services/github.service.js");
          const { ownerId, repositoryId } = await getGithubRepoDetails(syncToken, repository.owner, repository.name);
          githubProjectId = await createGithubProject(syncToken, ownerId, repositoryId, name);
        } catch (err) {
          console.error("Failed to create GitHub Project V2:", err);
          // Non-fatal error, we still want to create the local project
        }
      }
    }

    const project = await prisma.project.create({
      data: {
        workspaceId,
        name,
        description,
        createdById: req.user.id,
        githubProjectId,
      },
    });

    // Automatically generate the Activity!
    await logActivity(
      workspaceId,
      req.user.id,
      "PROJECT_CREATED",
      "PROJECT",
      project.id,
      `Created project "${project.name}"`,
    );

    return res.status(201).json({ success: true, data: project });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to create project." });
  }
};

// @desc    Get all projects in workspace
// @route   GET /api/organizations/:orgId/workspaces/:workspaceId/projects
export const getProjects = async (req, res) => {
  try {
    const workspaceId = req.workspace.id;
    const projects = await prisma.project.findMany({
      where: { workspaceId },
      include: {
        tasks: { select: { status: true } },
        createdBy: { select: { username: true, avatar: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate real-time progress on the fly for the UI
    const data = projects.map((p) => ({
      ...p,
      progress: calculateProgress(p.tasks),
      taskCount: p.tasks.length,
    }));

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch projects." });
  }
};

// @desc    Get specific project details
// @route   GET /api/organizations/:orgId/workspaces/:workspaceId/projects/:projectId
export const getProjectDetails = async (req, res) => {
  try {
    const workspaceId = req.workspace.id;
    const projectId = parseInt(req.params.projectId);

    const project = await prisma.project.findFirst({
      where: { id: projectId, workspaceId }, // Ensures data isolation!
      include: {
        tasks: {
          include: {
            assignee: { select: { username: true, avatar: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        createdBy: { select: { username: true, avatar: true } },
      },
    });

    if (!project)
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });

    project.progress = calculateProgress(project.tasks);

    return res.status(200).json({ success: true, data: project });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch project details." });
  }
};
