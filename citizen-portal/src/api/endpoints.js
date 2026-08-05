import api from './axios';

// Auth
export const registerCitizen = (payload) => api.post('/auth/register', payload);
export const loginCitizen = (payload) => api.post('/auth/login', { ...payload, role: 'citizen' });
export const getProfile = () => api.get('/auth/me');
export const updateProfile = (payload) => api.put('/auth/me', payload);
export const changePassword = (payload) => api.put('/auth/change-password', payload);

// Complaints
export const createComplaint = (formData) =>
  api.post('/complaints', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const getMyComplaints = (params) => api.get('/complaints', { params });
export const getComplaintById = (id) => api.get(`/complaints/${id}`);

// Notifications
export const getNotifications = (params) => api.get('/notifications', { params });
export const markNotificationRead = (id) => api.put(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.put('/notifications/read-all');
export const deleteNotification = (id) => api.delete(`/notifications/${id}`);
