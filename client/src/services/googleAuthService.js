import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

export const googleLogin = async (credential) => {
  const response = await axios.post(
    `${API_URL}/google`,
    {
      credential,
    },
    {
      withCredentials: true,
    }
  );

  return response.data;
};

export const completeProfile = async ({ username, role }) => {
  const response = await axios.post(
    `${API_URL}/complete-profile`,
    {
      username,
      role,
    },
    {
      withCredentials: true,
    }
  );

  return response.data;
};

export const logout = async () => {
  const response = await axios.post(
    `${API_URL}/logout`,
    {},
    {
      withCredentials: true,
    }
  );

  return response.data;
};