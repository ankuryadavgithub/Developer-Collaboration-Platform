// server/src/controllers/github.controller.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Now async, and pulls securely from the DB using the user ID
export const getGithubToken = async (req, res) => {
  // 1. Try to get the current user's token first
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
  });

  let githubToken = user?.githubAccessToken;

  // 2. FALLBACK: If the local user doesn't have a token, use the Workspace Creator's token!
  if (!githubToken && req.workspace?.id) {
    const workspace = await prisma.workspace.findUnique({
      where: { id: req.workspace.id },
      include: { createdBy: true }
    });
    
    if (workspace?.createdBy?.githubAccessToken) {
      githubToken = workspace.createdBy.githubAccessToken;
    }
  }

  // 3. If STILL no token is found anywhere, return an error
  if (!githubToken) {
    res.status(403).json({
      success: false,
      message: "GitHub is not connected to this workspace.",
    });
    return null;
  }

  return githubToken;
};

export const githubHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "Developer-Collaboration-Platform",
});

const getPriority = (labels) => {
  const labelNames = labels.map((label) => label.name.toLowerCase());

  if (labelNames.some((name) => name.includes("critical"))) {
    return "Critical";
  }

  if (labelNames.some((name) => name.includes("high"))) {
    return "High";
  }

  if (labelNames.some((name) => name.includes("low"))) {
    return "Low";
  }

  return "Medium";
};

export const getCurrentSprint = async (req, res) => {
  try {
    const githubToken = await getGithubToken(req, res);
    if (!githubToken) return;

    // SECURE: Fetch repo from the isolated Workspace context
    const repository = await prisma.repository.findUnique({ where: { workspaceId: req.workspace.id } });
    if (!repository) return res.status(404).json({ success: false, message: "No GitHub repository linked to this workspace." });

    const owner = repository.owner;
    const repo = repository.name;

    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/milestones?state=open&sort=due_on&direction=asc&per_page=100`, {
      headers: githubHeaders(githubToken),
    });

    const milestones = await response.json();
    if (!response.ok) return res.status(response.status).json({ success: false, message: milestones.message });

    if (!milestones.length) {
      return res.status(404).json({ success: false, message: "No open milestone found." });
    }

    const now = new Date();
    const currentSprint = milestones.find((m) => m.due_on && new Date(m.due_on) >= now) || milestones[0];
    const totalItems = currentSprint.open_issues + currentSprint.closed_issues;
    const progress = totalItems === 0 ? 0 : Math.round((currentSprint.closed_issues / totalItems) * 100);
    const daysLeft = currentSprint.due_on ? Math.max(0, Math.ceil((new Date(currentSprint.due_on) - now) / (1000 * 60 * 60 * 24))) : null;

    return res.status(200).json({
      success: true,
      data: {
        sprintNumber: currentSprint.number,
        title: currentSprint.title,
        description: currentSprint.description,
        dueDate: currentSprint.due_on,
        daysLeft,
        progress,
        totalItems,
        completedTasks: currentSprint.closed_issues,
        todoTasks: currentSprint.open_issues,
        storyPoints: null,
        inProgressTasks: null,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Could not fetch current sprint." });
  }
};

export const getOpenIssues = async (req, res) => {
  try {
    const githubToken = await getGithubToken(req, res);
    if (!githubToken) return;

    // SECURE: Fetch repo from the isolated Workspace context
    const repository = await prisma.repository.findUnique({ where: { workspaceId: req.workspace.id } });
    if (!repository) return res.status(404).json({ success: false, message: "No GitHub repository linked to this workspace." });

    const owner = repository.owner;
    const repo = repository.name;

    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues?state=open&sort=updated&direction=desc&per_page=30`, {
      headers: githubHeaders(githubToken),
    });

    const githubItems = await response.json();
    if (!response.ok) return res.status(response.status).json({ success: false, message: githubItems.message });

    const issues = githubItems
      .filter((item) => !item.pull_request)
      .slice(0, 5)
      .map((issue) => ({
        id: issue.number,
        title: issue.title,
        assignee: issue.assignee?.login || "Unassigned",
        priority: getPriority(issue.labels),
        url: issue.html_url,
        createdAt: issue.created_at,
        updatedAt: issue.updated_at,
      }));

    return res.status(200).json({ success: true, data: issues });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Could not fetch open issues." });
  }
};

export const getPullRequests = async (req, res) => {
  try {
    const githubToken = await getGithubToken(req, res);
    if (!githubToken) return;

    // SECURE: Fetch repo from the isolated Workspace context
    const repository = await prisma.repository.findUnique({ where: { workspaceId: req.workspace.id } });
    if (!repository) return res.status(404).json({ success: false, message: "No GitHub repository linked to this workspace." });

    const owner = repository.owner;
    const repo = repository.name;

    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls?state=open&sort=updated&direction=desc&per_page=50`, {
      headers: githubHeaders(githubToken),
    });

    const pullRequests = await response.json();
    if (!response.ok) return res.status(response.status).json({ success: false, message: pullRequests.message });

    const data = pullRequests.map((pullRequest) => ({
      id: pullRequest.number,
      title: pullRequest.title,
      author: pullRequest.user?.login || "Unknown",
      comments: pullRequest.comments || 0,
      status: pullRequest.draft ? "Draft" : pullRequest.requested_reviewers?.length > 0 ? "Review" : "Open",
      url: pullRequest.html_url,
      createdAt: pullRequest.created_at,
      updatedAt: pullRequest.updated_at,
    }));

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Could not fetch pull requests." });
  }
};

// @desc    Get all accessible repositories for the logged-in user
// @route   GET /api/github/repositories
export const getAccessibleRepositories = async (req, res) => {
  try {
    const githubToken = await getGithubToken(req, res);
    if (!githubToken) return; // Error response is already handled by getGithubToken

    // Fetch up to 100 recent repos
    const response = await fetch("https://api.github.com/user/repos?sort=updated&per_page=100", {
      headers: githubHeaders(githubToken),
    });

    const repos = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ success: false, message: repos.message || "Failed to fetch repositories from GitHub." });
    }

    // Strip out the massive amount of unnecessary GitHub data and return only what the frontend needs
    const data = repos.map(repo => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      owner: repo.owner.login,
      description: repo.description,
      visibility: repo.visibility,
      defaultBranch: repo.default_branch,
      htmlUrl: repo.html_url
    }));

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Fetch repos error:", error);
    return res.status(500).json({ success: false, message: "Could not fetch GitHub repositories." });
  }
};

// @desc    Handle incoming Webhooks from GitHub (Phase 3: Two-Way Sync)
// @route   POST /api/github/webhook
export const handleGithubWebhook = async (req, res) => {
  try {
    const event = req.headers["x-github-event"];
    const payload = req.body;

    console.log(`[GitHub Webhook] Received event: ${event}`);

    // Immediately respond to GitHub to prevent timeouts
    res.status(200).json({ received: true });

    if (event === "issues") {
      const { action, issue } = payload;
      
      // If an issue is closed on GitHub, mark our task as DONE
      if (action === "closed") {
        await prisma.task.updateMany({
          where: { githubIssueId: issue.node_id },
          data: { status: "DONE" },
        });
        console.log(`[GitHub Webhook] Task linked to issue ${issue.node_id} marked as DONE.`);
      }
      // If an issue is reopened on GitHub, mark our task as IN_PROGRESS or TODO
      else if (action === "reopened") {
        await prisma.task.updateMany({
          where: { githubIssueId: issue.node_id },
          data: { status: "IN_PROGRESS" },
        });
        console.log(`[GitHub Webhook] Task linked to issue ${issue.node_id} marked as IN_PROGRESS.`);
      }
    } else if (event === "projects_v2_item") {
      // TODO: Advanced GraphQL mapping required to detect exact column moves (TODO -> IN_PROGRESS, etc.)
      // The payload contains changes.field_value which maps to generic Option IDs.
      const { action, projects_v2_item } = payload;
      console.log(`[GitHub Webhook] Project V2 Item ${projects_v2_item.node_id} updated. action: ${action}`);
    } else if (event === "pull_request") {
        const { action, pull_request, repository: ghRepo } = payload;
        
        // HUGE SECURITY FIX: Look up the workspace associated with this GitHub repository.
        // Without this, an attacker sending a webhook payload for "#1" could modify Task ID 1 
        // in ANY workspace on the platform!
        const linkedRepo = await prisma.repository.findFirst({
          where: {
            owner: ghRepo?.owner?.login,
            name: ghRepo?.name
          }
        });

        if (!linkedRepo) {
          console.log(`[GitHub Webhook] Ignored PR event. Repository ${ghRepo?.full_name} is not linked to any workspace.`);
          return;
        }

        // Scan PR title and body for Task IDs, e.g. "#12" or "Fixes #12"
        const contentToScan = `${pull_request.title} ${pull_request.body || ""}`;
        const matches = [...contentToScan.matchAll(/#(\d+)/g)];
        const taskIds = matches.map(m => parseInt(m[1]));
        
        if (taskIds.length > 0) {
          if (action === "closed" && pull_request.merged) {
            // PR merged -> Automatically complete the task!
            await prisma.task.updateMany({
              // SECURITY ISOLATION: Ensure the tasks belong to THIS workspace!
              where: { id: { in: taskIds }, workspaceId: linkedRepo.workspaceId },
              data: { status: "DONE" },
            });
            console.log(`[GitHub Webhook] PR Merged! Marked tasks [${taskIds.join(', ')}] as DONE.`);
          } else if (action === "opened" || action === "reopened") {
            // PR opened -> Automatically move task to In Progress
            await prisma.task.updateMany({
              // SECURITY ISOLATION: Ensure the tasks belong to THIS workspace!
              where: { id: { in: taskIds }, workspaceId: linkedRepo.workspaceId },
              data: { status: "IN_PROGRESS" },
            });
            console.log(`[GitHub Webhook] PR ${action}. Marked tasks [${taskIds.join(', ')}] as IN_PROGRESS.`);
          }
        }
      }
  } catch (error) {
    console.error("[GitHub Webhook Error]:", error);
  }
};

// @desc    Get latest commits from the connected GitHub repository
// @route   GET /api/organizations/:orgId/workspaces/:workspaceId/github/commits
// 1. UPDATED getCommits function
export const getCommits = async (req, res) => {
  try {
    const githubToken = await getGithubToken(req, res);
    if (!githubToken) return;

    const repository = await prisma.repository.findUnique({ 
      where: { workspaceId: req.workspace.id } 
    });
    
    if (!repository) {
      return res.status(404).json({ success: false, message: "No GitHub repository linked." });
    }

    const { owner, name } = repository;
    
    // NEW: Look for a branch in the URL query
    const branch = req.query.branch;
    const branchQuery = branch ? `&sha=${branch}` : '';

    // NEW: I also increased per_page to 100!
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${name}/commits?per_page=100${branchQuery}`, 
      { headers: githubHeaders(githubToken) }
    );

    const commitsData = await response.json();
    if (!response.ok) return res.status(response.status).json({ success: false, message: commitsData.message });

    const formattedCommits = commitsData.map((commit) => ({
      sha: commit.sha,
      shortSha: commit.sha.substring(0, 7),
      message: commit.commit.message.split('\n')[0],
      author: commit.commit.author.name,
      avatar: commit.author?.avatar_url || `https://ui-avatars.com/api/?name=${commit.commit.author.name}`,
      url: commit.html_url,
      date: commit.commit.author.date,
    }));

    return res.status(200).json({ success: true, data: formattedCommits });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Could not fetch commits." });
  }
};

// 2. BRAND NEW function to get the list of branches
// BRAND NEW function to get the list of branches AND the default branch
export const getBranches = async (req, res) => {
  try {
    const githubToken = await getGithubToken(req, res);
    if (!githubToken) return;

    const repository = await prisma.repository.findUnique({ 
      where: { workspaceId: req.workspace.id } 
    });
    
    if (!repository) return res.status(404).json({ success: false, message: "No repo linked." });

    // 1. Ask GitHub for the Repository Details (this contains the true default branch)
    const repoResponse = await fetch(
      `https://api.github.com/repos/${repository.owner}/${repository.name}`, 
      { headers: githubHeaders(githubToken) }
    );
    const repoData = await repoResponse.json();
    const actualDefaultBranch = repoData.default_branch || "main"; // Fallback just in case

    // 2. Ask GitHub for the list of all branches
    const branchesResponse = await fetch(
      `https://api.github.com/repos/${repository.owner}/${repository.name}/branches`, 
      { headers: githubHeaders(githubToken) }
    );
    const branchesData = await branchesResponse.json();
    
    if (!branchesResponse.ok) return res.status(branchesResponse.status).json({ success: false, message: branchesData.message });

    // Format the response to send BOTH pieces of information to the frontend
    const formattedBranches = branchesData.map(b => b.name);
    
    return res.status(200).json({ 
      success: true, 
      data: {
        branches: formattedBranches,
        defaultBranch: actualDefaultBranch
      } 
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Could not fetch branches." });
  }
};