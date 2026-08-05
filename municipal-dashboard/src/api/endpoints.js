import api from './axios';

// Auth
export const loginAdmin = (payload) => api.post('/auth/login', { ...payload, role: 'admin' });
export const getProfile = () => api.get('/auth/me');

// Complaints
export const getComplaints = (params) => api.get('/complaints', { params });
export const getComplaintById = (id) => api.get(`/complaints/${id}`);
export const updateComplaintStatus = (id, payload) => api.put(`/complaints/${id}/status`, payload);
export const assignComplaint = (id, workerId) => api.put(`/complaints/${id}/assign`, { workerId });
export const deleteComplaint = (id) => api.delete(`/complaints/${id}`);
export const getMapLocations = (params) => api.get('/complaints/map/locations', { params });
export const getAnalyticsSummary = () => api.get('/complaints/analytics/summary');

// Workers
export const getWorkers = (params) => api.get('/workers', { params });
export const getWorkerById = (id) => api.get(`/workers/${id}`);
export const createWorker = (payload) => api.post('/workers', payload);
export const updateWorker = (id, payload) => api.put(`/workers/${id}`, payload);
export const deleteWorker = (id) => api.delete(`/workers/${id}`);

// Citizens
export const getCitizens = (params) => api.get('/users', { params });
export const getCitizenById = (id) => api.get(`/users/${id}`);
export const toggleCitizenStatus = (id) => api.put(`/users/${id}/status`);
