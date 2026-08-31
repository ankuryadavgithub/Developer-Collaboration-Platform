import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const calculateSprintProgress = (tasks) => {
  if (!tasks || tasks.length === 0) return 0;
  
  // Calculate progress based on the Kanban columns
  // TODO = 0%, IN_PROGRESS = 33%, IN_REVIEW = 66%, DONE = 100%
  const totalProgress = tasks.reduce((sum, t) => {
    if (t.status === "DONE") return sum + 100;
    if (t.status === "IN_REVIEW") return sum + 66;
    if (t.status === "IN_PROGRESS") return sum + 33;
    return sum;
  }, 0);

  return Math.round(totalProgress / tasks.length);
};

const calculateProjectProgress = (tasks) => {
  if (!tasks || tasks.length === 0) return 0;
  
  const totalProgress = tasks.reduce((sum, t) => {
    if (t.status === "DONE") return sum + 100;
    if (t.status === "IN_REVIEW") return sum + 66;
    if (t.status === "IN_PROGRESS") return sum + 33;
    return sum;
  }, 0);

  return Math.round(totalProgress / tasks.length);
};

// @desc    Get aggregated dashboard data for a workspace
// @route   GET /api/organizations/:orgId/workspaces/:workspaceId/dashboard
export const getWorkspaceDashboardData = async (req, res) => {
  try {
    const workspaceId = req.workspace.id;

    // 1. Get Workspace info (Members count, Repo)
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        repository: true,
        _count: { select: { members: true } },
      },
    });

    // 2. Get Active Sprint details
    const activeSprintData = await prisma.sprint.findFirst({
      where: { workspaceId, status: "ACTIVE" },
      include: { tasks: true },
    });

    let currentSprint = null;
    if (activeSprintData) {
      const completedTasksCount = activeSprintData.tasks.filter(
        (t) => t.status === "DONE",
      ).length;
      const inProgressTasksCount = activeSprintData.tasks.filter(
        (t) => t.status === "IN_PROGRESS" || t.status === "IN_REVIEW",
      ).length;
      const todoTasksCount = activeSprintData.tasks.filter(
        (t) => t.status === "TODO",
      ).length;

      currentSprint = {
        id: activeSprintData.id,
        name: activeSprintData.name,
        goal: activeSprintData.goal,
        startDate: activeSprintData.startDate,
        endDate: activeSprintData.endDate,
        progress: calculateSprintProgress(activeSprintData.tasks),
        totalStoryPoints: activeSprintData.tasks.reduce(
          (sum, t) => sum + (t.storyPoints || 0),
          0,
        ),
        completedStoryPoints: activeSprintData.tasks
          .filter((t) => t.status === "DONE")
          .reduce((sum, t) => sum + (t.storyPoints || 0), 0),
        stats: {
          completed: completedTasksCount,
          inProgress: inProgressTasksCount,
          todo: todoTasksCount,
        },
      };
    }

    // 3. Get Project Overviews (Limit to recent/active)
    const projectsData = await prisma.project.findMany({
      where: { workspaceId, status: { not: "ARCHIVED" } },
      include: { tasks: { select: { status: true } } },
      take: 4,
      orderBy: { updatedAt: "desc" },
    });

    const projectOverview = projectsData.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      progress: calculateProjectProgress(p.tasks),
    }));

    // 4. Get Recent Activities
    const recentActivity = await prisma.activity.findMany({
      where: { workspaceId },
      include: { user: { select: { username: true, avatar: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // 4.5 Fetch Open Bugs from GitHub
    let openBugsCount = 0;
    try {
      if (workspace.repository) {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (user && user.githubAccessToken) {
          const owner = workspace.repository.owner;
          const repo = workspace.repository.name;
          const searchRes = await fetch(`https://api.github.com/search/issues?q=repo:${owner}/${repo}+type:issue+state:open+label:bug`, {
            headers: {
              Authorization: `Bearer ${user.githubAccessToken}`,
              Accept: "application/vnd.github+json",
              "X-GitHub-Api-Version": "2022-11-28",
              "User-Agent": "Developer-Collaboration-Platform",
            }
          });
          if (searchRes.ok) {
            const searchData = await searchRes.json();
            openBugsCount = searchData.total_count || 0;
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch bugs from GitHub:", err);
    }

    // 5. Aggregate KPIs
    const totalProjectsCount = await prisma.project.count({
      where: { workspaceId },
    });
    const activeSprintsCount = await prisma.sprint.count({
      where: { workspaceId, status: "ACTIVE" },
    });
    const tasksCompletedCount = await prisma.task.count({
      where: { workspaceId, status: "DONE" },
    });
    const totalSprintsCount = await prisma.sprint.count({
      where: { workspaceId },
    });
    const totalTasksCount = await prisma.task.count({
      where: { workspaceId },
    });

    const kpis = {
      totalProjects: totalProjectsCount,
      activeSprints: activeSprintsCount,
      tasksCompleted: tasksCompletedCount,
      openBugs: openBugsCount, 
      totalSprints: totalSprintsCount,
      totalTasks: totalTasksCount,
    };

    return res.status(200).json({
      success: true,
      data: {
        workspace: {
          id: workspace.id,
          name: workspace.name,
          repository: workspace.repository,
        },
        kpis,
        currentSprint,
        projectOverview,
        recentActivity,
      },
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to load dashboard data." });
  }
};
