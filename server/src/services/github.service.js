// Helper to execute GraphQL queries against GitHub
const executeGraphql = async (token, query, variables = {}) => {
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "Developer-Collaboration-Platform",
    },
    body: JSON.stringify({ query, variables }),
  });

  const data = await response.json();

  if (data.errors) {
    console.error("GitHub GraphQL Error:", JSON.stringify(data.errors, null, 2));
    throw new Error(data.errors[0].message);
  }

  return data.data;
};

export const createGithubIssue = async (token, owner, repo, title, body) => {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "Developer-Collaboration-Platform",
    },
    body: JSON.stringify({ title, body }),
  });
  
  const data = await response.json();
  
  return {
    issueId: data.node_id,
    issueNum: data.number,
  };
};

export const assignGithubIssue = async (token, owner, repo, issueNum, assignees) => {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues/${issueNum}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "Developer-Collaboration-Platform",
    },
    body: JSON.stringify({ assignees }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return await response.json();
};

export const updateGithubIssueState = async (token, owner, repo, issueNum, state) => {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues/${issueNum}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "Developer-Collaboration-Platform",
    },
    body: JSON.stringify({ state }), // "open" or "closed"
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return await response.json();
};

export const addIssueToGithubProject = async (token, projectId, issueNodeId) => {
  const mutation = `
    mutation($projectId: ID!, $contentId: ID!) {
      addProjectV2ItemById(input: {
        projectId: $projectId,
        contentId: $contentId
      }) {
        item {
          id
        }
      }
    }
  `;

  const data = await executeGraphql(token, mutation, {
    projectId,
    contentId: issueNodeId,
  });

  return data.addProjectV2ItemById.item.id;
};

export const getGithubRepoDetails = async (token, owner, repo) => {
  const query = `
    query($owner: String!, $repo: String!) {
      repository(owner: $owner, name: $repo) {
        id
        owner {
          id
        }
      }
    }
  `;
  const data = await executeGraphql(token, query, { owner, repo });
  return {
    repositoryId: data.repository.id,
    ownerId: data.repository.owner.id,
  };
};

export const createGithubProject = async (token, ownerId, repositoryId, title) => {
  // 1. Create the project
  const createMutation = `
    mutation($ownerId: ID!, $title: String!) {
      createProjectV2(input: {
        ownerId: $ownerId,
        title: $title
      }) {
        projectV2 {
          id
        }
      }
    }
  `;
  const createData = await executeGraphql(token, createMutation, { ownerId, title });
  const projectId = createData.createProjectV2.projectV2.id;

  // 2. Link the project to the repository so it shows up in the 'Projects' tab!
  const linkMutation = `
    mutation($projectId: ID!, $repositoryId: ID!) {
      linkProjectV2ToRepository(input: {
        projectId: $projectId,
        repositoryId: $repositoryId
      }) {
        repository {
          id
        }
      }
    }
  `;
  await executeGraphql(token, linkMutation, { projectId, repositoryId });

  return projectId;
};
