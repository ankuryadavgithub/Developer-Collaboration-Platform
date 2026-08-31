import axios from 'axios';

const API_URL = 'http://localhost:5000/api/invitations';

// Get all pending invitations for the logged-in user
export const getPendingInvitations = async () => {
  const response = await axios.get(`${API_URL}/mine`, { withCredentials: true });
  return response.data;
};

// Accept an invitation
export const acceptInvitation = async (invitationId) => {
  const response = await axios.patch(`${API_URL}/${invitationId}/accept`, {}, { withCredentials: true });
  return response.data;
};

// Reject an invitation
export const rejectInvitation = async (invitationId) => {
  const response = await axios.patch(`${API_URL}/${invitationId}/reject`, {}, { withCredentials: true });
  return response.data;
};
