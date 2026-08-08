import { PrismaClient } from "@prisma/client";
import { logActivity } from "../utils/activityLogger.js";

const prisma = new PrismaClient();

// @desc    Create a new task
// @route   POST /api/organizations/:orgId/workspaces/:workspaceId/tasks
export const createTask = async (req, res) => {
  try {
    const workspaceId = req.workspace.id;
    const {
      projectId,
      sprintId,
      title,
      description,
      priority,
      assigneeId,
      dueDate,
      storyPoints,
    } = req.body;

    if (!projectId || !title)
      return res
        .status(400)
        .json({
          success: false,
          message: "Project ID and Title are required.",
        });

    // Enforce data isolation: Project MUST belong to this Workspace
    const project = await prisma.project.findUnique({
      where: { id: parseInt(projectId) },
    });
    if (!project || project.workspaceId !== workspaceId) {
      return res
        .status(403)
        .json({ success: false, message: "Invalid project specified." });
    }

    // Enforce assignment rule: Assignee MUST belong to this Workspace
    if (assigneeId) {
      const member = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: { workspaceId, userId: parseInt(assigneeId) },
        },
      });
      if (!member)
        return res
          .status(403)
          .json({
            success: false,
            message: "Assignee must be a member of this workspace.",
          });
    }

    // Enforce Sprint isolation
    if (sprintId) {
      const sprint = await prisma.sprint.findUnique({
        where: { id: parseInt(sprintId) },
      });
      if (!sprint || sprint.workspaceId !== workspaceId)
        return res
          .status(403)
          .json({ success: false, message: "Invalid sprint specified." });
    }

    const task = await prisma.task.create({
      data: {
        workspaceId,
        projectId: parseInt(projectId),
        sprintId: sprintId ? parseInt(sprintId) : null,
        title,
        description,
        priority: priority || "MEDIUM",
        assigneeId: assigneeId ? parseInt(assigneeId) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        storyPoints: storyPoints ? parseInt(storyPoints) : 0,
        createdById: req.user.id,
      },
    });

    await logActivity(
      workspaceId,
      req.user.id,
      "TASK_CREATED",
      "TASK",
      task.id,
      `Created task "${task.title}"`,
    );
    if (assigneeId) {
      await logActivity(
        workspaceId,
        req.user.id,
        "TASK_UPDATED",
        "TASK",
        task.id,
        `Assigned task "${task.title}" to a workspace member`,
      );
    }

    return res.status(201).json({ success: true, data: task });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to create task." });
  }
};

// @desc    Get all tasks (with optional filtering)
// @route   GET /api/organizations/:orgId/workspaces/:workspaceId/tasks
export const getTasks = async (req, res) => {
  try {
    const workspaceId = req.workspace.id;
    const { projectId, sprintId, status, assigneeId } = req.query;

    const where = { workspaceId };
    if (projectId) where.projectId = parseInt(projectId);
    if (sprintId) where.sprintId = parseInt(sprintId);
    if (status) where.status = status;
    if (assigneeId) where.assigneeId = parseInt(assigneeId);

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: { select: { id: true, username: true, avatar: true } },
        project: { select: { name: true } },
        sprint: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch tasks." });
  }
};

// @desc    Update a task (status, sprint, assignee)
// @route   PATCH /api/organizations/:orgId/workspaces/:workspaceId/tasks/:taskId
export const updateTask = async (req, res) => {
  try {
    const workspaceId = req.workspace.id;
    const taskId = parseInt(req.params.taskId);
    const { status, priority, assigneeId, sprintId, storyPoints } = req.body;

    const existing = await prisma.task.findFirst({
      where: { id: taskId, workspaceId },
    });
    if (!existing)
      return res
        .status(404)
        .json({ success: false, message: "Task not found." });

    if (assigneeId && assigneeId !== existing.assigneeId) {
      const member = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: { workspaceId, userId: parseInt(assigneeId) },
        },
      });
      if (!member)
        return res
          .status(403)
          .json({
            success: false,
            message: "Assignee must be a member of this workspace.",
          });
    }

    if (sprintId && sprintId !== existing.sprintId) {
      const sprint = await prisma.sprint.findUnique({
        where: { id: parseInt(sprintId) },
      });
      if (!sprint || sprint.workspaceId !== workspaceId)
        return res
          .status(403)
          .json({ success: false, message: "Invalid sprint specified." });
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        status: status || existing.status,
        priority: priority || existing.priority,
        // Allow removing assignee by explicitly passing null
        assigneeId:
          assigneeId !== undefined
            ? assigneeId
              ? parseInt(assigneeId)
              : null
            : existing.assigneeId,
        sprintId:
          sprintId !== undefined
            ? sprintId
              ? parseInt(sprintId)
              : null
            : existing.sprintId,
        storyPoints:
          storyPoints !== undefined
            ? parseInt(storyPoints)
            : existing.storyPoints,
      },
    });

    if (status && status !== existing.status) {
      if (status === "DONE") {
        await logActivity(
          workspaceId,
          req.user.id,
          "TASK_COMPLETED",
          "TASK",
          task.id,
          `Completed task "${task.title}"`,
        );
      } else {
        await logActivity(
          workspaceId,
          req.user.id,
          "TASK_UPDATED",
          "TASK",
          task.id,
          `Moved task "${task.title}" to ${status}`,
        );
      }
    }

    return res.status(200).json({ success: true, data: task });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to update task." });
  }
};
