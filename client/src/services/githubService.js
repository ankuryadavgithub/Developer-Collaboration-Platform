// client/src/services/githubService.js

import axios from "axios";

const API_URL = "http://localhost:5000/api/github";

const OWNER = "ankuryadavgithub";
const REPOSITORY = "Developer-Collaboration-Platform";

const repositoryUrl = `${API_URL}/repos/${OWNER}/${REPOSITORY}`;

export const getCurrentSprint = async () => {
  const response = await axios.get(
    `${repositoryUrl}/current-sprint`,
    {
      withCredentials: true,
    }
  );

  return response.data;
};

export const getOpenIssues = async () => {
  const response = await axios.get(
    `${repositoryUrl}/issues`,
    {
      withCredentials: true,
    }
  );

  return response.data;
};

export const getPullRequests = async () => {
  const response = await axios.get(
    `${repositoryUrl}/pull-requests`,
    {
      withCredentials: true,
    }
  );

  return response.data;
};

