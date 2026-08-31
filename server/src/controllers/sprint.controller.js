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
    let { name, goal, startDate, endDate } = req.body;

    if (!name || typeof name !== "string") {
      return res.status(400).json({ success: false, message: "A valid sprint name is required" });
    }

    name = name.trim();
    if (name.length === 0 || name.length > 100) {
      return res.status(400).json({ success: false, message: "Sprint name must be between 1 and 100 characters." });
    }

    let trimmedGoal = null;
    if (goal) {
      if (typeof goal !== "string") {
        return res.status(400).json({ success: false, message: "Goal must be a string." });
      }
      trimmedGoal = goal.trim();
      if (trimmedGoal.length > 1000) {
        return res.status(400).json({ success: false, message: "Goal must be 1000 characters or less." });
      }
    }

    const sprint = await prisma.sprint.create({
      data: {
        workspaceId,
        name,
        goal: trimmedGoal,
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

// @desc    Update a sprint (status, details)
// @route   PATCH /api/organizations/:orgId/workspaces/:workspaceId/sprints/:sprintId
export const updateSprint = async (req, res) => {
  try {
    const workspaceId = req.workspace.id;
    const sprintId = parseInt(req.params.sprintId);
    if (isNaN(sprintId)) {
      return res.status(400).json({ success: false, message: "Invalid Sprint ID." });
    }

    let { status, name, goal, startDate, endDate } = req.body;

    if (name !== undefined) {
      if (typeof name !== "string") return res.status(400).json({ success: false, message: "Name must be a string." });
      name = name.trim();
      if (name.length === 0 || name.length > 100) return res.status(400).json({ success: false, message: "Sprint name must be between 1 and 100 characters." });
    }

    if (goal !== undefined && goal !== null) {
      if (typeof goal !== "string") return res.status(400).json({ success: false, message: "Goal must be a string." });
      goal = goal.trim();
      if (goal.length > 1000) return res.status(400).json({ success: false, message: "Goal must be 1000 characters or less." });
    }

    const existingSprint = await prisma.sprint.findUnique({
      where: { id: sprintId, workspaceId },
      include: { tasks: true }
    });

    if (!existingSprint) {
      return res.status(404).json({ success: false, message: "Sprint not found." });
    }

    // 1. Date Validation (Start date <= End date)
    const start = startDate ? new Date(startDate) : existingSprint.startDate;
    const end = endDate ? new Date(endDate) : existingSprint.endDate;
    if (start && end && start > end) {
      return res.status(400).json({ success: false, message: "Start date must be before or equal to End date." });
    }

    // 2. Status Transition Validation
    if (status && status !== existingSprint.status) {
      if (status === "ACTIVE") {
        if (existingSprint.status !== "PLANNED") {
          return res.status(400).json({ success: false, message: "Only PLANNED sprints can be started." });
        }
        // Enforce 1 Active Sprint rule
        const activeSprint = await prisma.sprint.findFirst({
          where: { workspaceId, status: "ACTIVE" },
        });
        if (activeSprint) {
          return res.status(409).json({ success: false, message: `Conflict: Cannot start sprint. "${activeSprint.name}" is currently active.` });
        }
      } else if (status === "COMPLETED") {
        if (existingSprint.status !== "ACTIVE") {
          return res.status(400).json({ success: false, message: "Only ACTIVE sprints can be completed." });
        }
      }
    }

    const updatedSprint = await prisma.sprint.update({
      where: { id: sprintId, workspaceId },
      data: {
        status: status || existingSprint.status,
        name: name !== undefined ? name : existingSprint.name,
        goal: goal !== undefined ? goal : existingSprint.goal,
        startDate: start,
        endDate: end
      },
      include: {
        tasks: {
          include: {
             assignee: { select: { id: true, username: true, avatar: true } },
          }
        }
      }
    });

    return res.status(200).json({ success: true, data: updatedSprint });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update sprint." });
  }
};