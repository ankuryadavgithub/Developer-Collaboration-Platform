import { PrismaClient } from "@prisma/client";
import ical from "ical-generator";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

const parseCalendarBoundary = (value, isEnd = false) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T${isEnd ? "23:59:59.999" : "00:00:00.000"}Z`);
  return Number.isNaN(date.getTime()) ? null : date;
};

// @desc    Get all calendar events (tasks and sprints) for a workspace
// @route   GET /api/organizations/:orgId/workspaces/:workspaceId/calendar
export const getWorkspaceCalendar = async (req, res) => {
  try {
    const workspaceId = req.workspace.id;
    const { start, end, assigneeId, hideCompleted, projectId, priority } = req.query;

    if (assigneeId && assigneeId !== "null" && Number.isNaN(Number.parseInt(assigneeId, 10))) {
      return res.status(400).json({ success: false, message: "Invalid assignee filter." });
    }
    if (projectId && projectId !== "null" && projectId !== "ALL" && Number.isNaN(Number.parseInt(projectId, 10))) {
      return res.status(400).json({ success: false, message: "Invalid project filter." });
    }

    const rangeStart = start ? parseCalendarBoundary(start) : null;
    const rangeEnd = end ? parseCalendarBoundary(end, true) : null;
    if ((start && !rangeStart) || (end && !rangeEnd) || (rangeStart && rangeEnd && rangeStart > rangeEnd)) {
      return res.status(400).json({ success: false, message: "Invalid calendar date range." });
    }

    const taskWhere = { workspaceId };
    
    if (assigneeId && assigneeId !== "null") {
      taskWhere.assigneeId = parseInt(assigneeId);
    }
    
    if (projectId && projectId !== "null" && projectId !== "ALL") {
      taskWhere.projectId = parseInt(projectId);
    }

    if (priority && priority !== "ALL") {
      taskWhere.priority = priority;
    }

    if (hideCompleted === "true") {
      taskWhere.status = { not: "DONE" };
    }

    // Date range filter for tasks with due dates
    if (rangeStart && rangeEnd) {
      taskWhere.OR = [
        {
          dueDate: {
            gte: rangeStart,
            lte: rangeEnd,
          },
        },
        {
          dueDate: null, // Always include backlog tasks so right drawer has them
        }
      ];
    }

    const tasks = await prisma.task.findMany({
      where: taskWhere,
      include: {
        assignee: { select: { id: true, username: true, avatar: true } },
        project: { select: { id: true, name: true } },
        sprint: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Sprints query
    const sprintWhere = { workspaceId };
    if (hideCompleted === "true") {
      sprintWhere.status = { not: "COMPLETED" };
    }
    if (rangeStart && rangeEnd) {
      sprintWhere.AND = [
        { startDate: { lte: rangeEnd } },
        { endDate: { gte: rangeStart } },
      ];
    }

    const sprints = await prisma.sprint.findMany({
      where: sprintWhere,
      orderBy: { startDate: "asc" },
    });

    return res.status(200).json({
      success: true,
      data: {
        tasks,
        sprints,
      },
    });
  } catch (error) {
    console.error("Calendar fetch error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch calendar data." });
  }
};

// @desc    Get or generate user's secure calendar token
// @route   GET /api/organizations/:orgId/workspaces/:workspaceId/calendar/token
export const getCalendarToken = async (req, res) => {
  try {
    const userId = req.user.id;
    let user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user.calendarToken) {
      user = await prisma.user.update({
        where: { id: userId },
        data: { calendarToken: uuidv4() },
      });
    }

    return res.status(200).json({
      success: true,
      token: user.calendarToken,
    });
  } catch (error) {
    console.error("Generate token error:", error);
    return res.status(500).json({ success: false, message: "Failed to obtain calendar token." });
  }
};

// @desc    Serve public iCal feed using calendarToken
// @route   GET /api/calendar/:token.ics
export const getICalFeed = async (req, res) => {
  try {
    const { token } = req.params;
    const cleanToken = token.replace(/\.ics$/, "");

    const user = await prisma.user.findUnique({
      where: { calendarToken: cleanToken },
    });

    if (!user) {
      return res.status(404).send("Calendar feed not found or invalid token.");
    }

    // Get all pending tasks assigned to user across all workspaces
    const tasks = await prisma.task.findMany({
      where: {
        assigneeId: user.id,
        dueDate: { not: null },
        status: { not: "DONE" },
      },
      include: {
        project: { select: { name: true } },
        workspace: { select: { name: true, organizationId: true } },
      },
    });

    const calendar = ical({
      name: `DevHub - ${user.username || "My Tasks"}`,
      timezone: "UTC",
    });

    tasks.forEach((task) => {
      const due = new Date(task.dueDate);
      const exclusiveEnd = new Date(due);
      exclusiveEnd.setUTCDate(exclusiveEnd.getUTCDate() + 1);
      calendar.createEvent({
        start: due,
        end: exclusiveEnd,
        allDay: true,
        summary: `[${task.workspace?.name || "DevHub"}] ${task.title}`,
        description: `Project: ${task.project?.name || "General"}\nPriority: ${task.priority}\nStatus: ${task.status}\n\n${task.description || ""}`,
        url: `${req.protocol}://${req.get("host").replace("5000", "5173")}/organizations/${task.workspace?.organizationId || ""}/workspaces/${task.workspaceId}/calendar`,
      });
    });

    res.set("Content-Type", "text/calendar; charset=utf-8");
    res.set("Content-Disposition", `attachment; filename="devhub-tasks-${user.id}.ics"`);
    return res.send(calendar.toString());
  } catch (error) {
    console.error("iCal generation error:", error);
    return res.status(500).send("Failed to generate calendar feed.");
  }
};
