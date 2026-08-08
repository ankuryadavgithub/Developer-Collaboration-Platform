import { PrismaClient } from "@prisma/client";
import { logActivity } from "../utils/activityLogger.js";

const prisma = new PrismaClient();

// Helper to calculate progress based on Story Points (fallback to task count)
const calculateSprintProgress = (tasks) => {
  if (!tasks || tasks.length === 0) return 0;

  const totalPoints = tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
  const completedPoints = tasks
    .filter((t) => t.status === "DONE")
    .reduce((sum, t) => sum + (t.storyPoints || 0), 0);

  if (totalPoints > 0) {
    return Math.round((completedPoints / totalPoints) * 100);
  }

  // Fallback to task count if no story points exist
  const completed = tasks.filter((t) => t.status === "DONE").length;
  return Math.round((completed / tasks.length) * 100);
};

// @desc    Create a new sprint
// @route   POST /api/organizations/:orgId/workspaces/:workspaceId/sprints
export const createSprint = async (req, res) => {
  try {
    const workspaceId = req.workspace.id;
    const { name, goal, startDate, endDate } = req.body;

    if (!name)
      return res
        .status(400)
        .json({ success: false, message: "Sprint name is required" });

    const sprint = await prisma.sprint.create({
      data: {
        workspaceId,
        name,
        goal,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        createdById: req.user.id,
      },
    });

    await logActivity(
      workspaceId,
      req.user.id,
      "SPRINT_CREATED",
      "SPRINT",
      sprint.id,
      `Created sprint "${sprint.name}"`,
    );

    return res.status(201).json({ success: true, data: sprint });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to create sprint." });
  }
};

// @desc    Get all sprints in workspace
// @route   GET /api/organizations/:orgId/workspaces/:workspaceId/sprints
export const getSprints = async (req, res) => {
  try {
    const workspaceId = req.workspace.id;
    const sprints = await prisma.sprint.findMany({
      where: { workspaceId },
      include: {
        tasks: { select: { status: true, storyPoints: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const data = sprints.map((s) => ({
      ...s,
      progress: calculateSprintProgress(s.tasks),
      taskCount: s.tasks.length,
    }));

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch sprints." });
  }
};

// @desc    Start a sprint (Enforces 1 Active Sprint Rule)
// @route   POST /api/organizations/:orgId/workspaces/:workspaceId/sprints/:sprintId/start
export const startSprint = async (req, res) => {
  try {
    const workspaceId = req.workspace.id;
    const sprintId = parseInt(req.params.sprintId);

    // CRITICAL REQUIREMENT: Only one active sprint per workspace
    const activeSprint = await prisma.sprint.findFirst({
      where: { workspaceId, status: "ACTIVE" },
    });

    if (activeSprint) {
      return res
        .status(409)
        .json({
          success: false,
          message: `Conflict: Cannot start sprint. "${activeSprint.name}" is currently active.`,
        });
    }

    const sprint = await prisma.sprint.update({
      where: { id: sprintId, workspaceId },
      data: { status: "ACTIVE" },
    });

    await logActivity(
      workspaceId,
      req.user.id,
      "SPRINT_STARTED",
      "SPRINT",
      sprint.id,
      `Started sprint "${sprint.name}"`,
    );

    return res.status(200).json({ success: true, data: sprint });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to start sprint." });
  }
};

// @desc    Complete a sprint
// @route   POST /api/organizations/:orgId/workspaces/:workspaceId/sprints/:sprintId/complete
export const completeSprint = async (req, res) => {
  try {
    const workspaceId = req.workspace.id;
    const sprintId = parseInt(req.params.sprintId);

    const sprint = await prisma.sprint.update({
      where: { id: sprintId, workspaceId },
      data: { status: "COMPLETED" },
    });

    await logActivity(
      workspaceId,
      req.user.id,
      "SPRINT_COMPLETED",
      "SPRINT",
      sprint.id,
      `Completed sprint "${sprint.name}"`,
    );

    return res.status(200).json({ success: true, data: sprint });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to complete sprint." });
  }
};
