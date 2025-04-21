import axios from 'axios';

const API_BASE_URL = 'http://172.16.19.118:5050/backoffice';

export const fetchUsers = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/get_users`);
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

export const fetchUserEvents = async (eventIds) => {
  try {
    const eventRequests = eventIds.map((id) =>
      axios.get(`${API_BASE_URL}/get_events?event_id=${id}`)
    );
    const eventResponses = await Promise.all(eventRequests);
    return eventResponses.map((res) => res.data);
  } catch (error) {
    console.error('Error fetching user events:', error);
    return [];
  }
};

export const addUser = async (userData) => {
  try {
    await axios.post(`${API_BASE_URL}/add_user`, userData);
  } catch (error) {
    console.error('Error adding user:', error);
  }
};

export const updateUser = async (userId, userData) => {
  try {
    await axios.put(`${API_BASE_URL}/update_user/${userId}`, userData);
  } catch (error) {
    console.error('Error updating user:', error);
  }
};

export const deleteUser = async (userId) => {
  try {
    await axios.delete(`${API_BASE_URL}/delete_user/${userId}`);
  } catch (error) {
    console.error('Error deleting user:', error);
  }
};

export const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});
