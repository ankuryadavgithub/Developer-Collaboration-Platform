// server/src/controllers/github.controller.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Now async, and pulls securely from the DB using the user ID
const getGithubToken = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
  });

  const githubToken = user?.githubAccessToken;

  if (!githubToken) {
    res.status(403).json({
      success: false,
      message: "GitHub is not connected. Please log in with GitHub.",
    });

    return null;
  }

  return githubToken;
};

const githubHeaders = (token) => ({
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
    const githubToken = await getGithubToken(req, res); // Added await

    if (!githubToken) {
      return;
    }

    const { owner, repo } = req.params;

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/milestones?state=open&sort=due_on&direction=asc&per_page=100`,
      {
        headers: githubHeaders(githubToken),
      }
    );

    const milestones = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: milestones.message || "Could not fetch GitHub milestones.",
      });
    }

    if (!milestones.length) {
      return res.status(404).json({
        success: false,
        message: "No open milestone found. Create a GitHub milestone first.",
      });
    }

    const now = new Date();

    // Uses the nearest milestone that has not passed its due date.
    const currentSprint =
      milestones.find(
        (milestone) =>
          milestone.due_on && new Date(milestone.due_on) >= now
      ) || milestones[0];

    const totalItems =
      currentSprint.open_issues + currentSprint.closed_issues;

    const progress =
      totalItems === 0
        ? 0
        : Math.round((currentSprint.closed_issues / totalItems) * 100);

    const daysLeft = currentSprint.due_on
      ? Math.max(
          0,
          Math.ceil(
            (new Date(currentSprint.due_on) - now) /
              (1000 * 60 * 60 * 24)
          )
        )
      : null;

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

        // GitHub milestones do not natively store story points.
        storyPoints: null,
        inProgressTasks: null,
      },
    });
  } catch (error) {
    console.error("Current sprint API error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not fetch current sprint.",
    });
  }
};

export const getOpenIssues = async (req, res) => {
  try {
    const githubToken = await getGithubToken(req, res); // Added await

    if (!githubToken) {
      return;
    }

    const { owner, repo } = req.params;

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues?state=open&sort=updated&direction=desc&per_page=30`,
      {
        headers: githubHeaders(githubToken),
      }
    );

    const githubItems = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: githubItems.message || "Could not fetch GitHub issues.",
      });
    }

    // GitHub's Issues API can include pull requests.
    // A real issue has no pull_request property.
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

    return res.status(200).json({
      success: true,
      data: issues,
    });
  } catch (error) {
    console.error("Open issues API error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not fetch open issues.",
    });
  }
};

export const getPullRequests = async (req, res) => {
  try {
    const githubToken = await getGithubToken(req, res); // Added await

    if (!githubToken) {
      return;
    }

    const { owner, repo } = req.params;

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls?state=open&sort=updated&direction=desc&per_page=5`,
      {
        headers: githubHeaders(githubToken),
      }
    );

    const pullRequests = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message:
          pullRequests.message || "Could not fetch GitHub pull requests.",
      });
    }

    const data = pullRequests.map((pullRequest) => ({
      id: pullRequest.number,
      title: pullRequest.title,
      author: pullRequest.user.login,
      comments: pullRequest.comments,
      status: pullRequest.draft
        ? "Draft"
        : pullRequest.requested_reviewers.length > 0
          ? "Review"
          : "Open",
      url: pullRequest.html_url,
      createdAt: pullRequest.created_at,
      updatedAt: pullRequest.updated_at,
    }));

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Pull requests API error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not fetch pull requests.",
    });
  }
};