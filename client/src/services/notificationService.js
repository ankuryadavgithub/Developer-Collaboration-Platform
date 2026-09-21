import axios from "axios";

const API_URL = "http://localhost:5000/api/notifications";

export const getNotifications = async () => {
  const response = await axios.get(API_URL, { withCredentials: true });
  return response.data;
};

export const getUnreadCount = async () => {
  const response = await axios.get(`${API_URL}/unread-count`, { withCredentials: true });
  return response.data;
};

export const markAsRead = async (id) => {
  const response = await axios.patch(`${API_URL}/${id}/read`, {}, { withCredentials: true });
  return response.data;
};

export const markAllAsRead = async () => {
  const response = await axios.patch(`${API_URL}/read-all`, {}, { withCredentials: true });
  return response.data;
};
