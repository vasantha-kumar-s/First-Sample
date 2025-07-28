import axios from 'axios';
import useAuthStore from '../store/authStore';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (username, password) => 
    api.post('/auth/token', new URLSearchParams({ username, password })),
  
  register: (userData) => 
    api.post('/auth/register', userData),
  
  getProfile: () => 
    api.get('/auth/me'),
};

// Roadmaps API
export const roadmapsAPI = {
  getAll: () => api.get('/roadmaps/'),
  create: (roadmap) => api.post('/roadmaps/', roadmap),
  get: (id) => api.get(`/roadmaps/${id}`),
  getMilestones: (id) => api.get(`/roadmaps/${id}/milestones`),
  createMilestone: (roadmapId, milestone) => 
    api.post(`/roadmaps/${roadmapId}/milestones`, milestone),
  completeMilestone: (milestoneId) => 
    api.put(`/roadmaps/milestones/${milestoneId}/complete`),
  seedPredefined: () => api.post('/roadmaps/predefined'),
};

// Tasks API
export const tasksAPI = {
  getAll: () => api.get('/tasks/'),
  create: (task) => api.post('/tasks/', task),
  get: (id) => api.get(`/tasks/${id}`),
  update: (id, task) => api.put(`/tasks/${id}`, task),
  complete: (id, actualHours) => 
    api.put(`/tasks/${id}/complete`, { actual_hours: actualHours }),
  delete: (id) => api.delete(`/tasks/${id}`),
  getToday: () => api.get('/tasks/today/'),
};

// Habits API
export const habitsAPI = {
  getAll: () => api.get('/habits/'),
  create: (habit) => api.post('/habits/', habit),
  get: (id) => api.get(`/habits/${id}`),
  update: (id, habit) => api.put(`/habits/${id}`, habit),
  delete: (id) => api.delete(`/habits/${id}`),
  getEntries: (id) => api.get(`/habits/${id}/entries`),
  createEntry: (habitId, entry) => 
    api.post(`/habits/${habitId}/entries`, entry),
  getToday: () => api.get('/habits/today/'),
  quickLog: (habitId, completed, rating, notes) => 
    api.post('/habits/quick-log', { habit_id: habitId, completed, rating, notes }),
};

// Analytics API
export const analyticsAPI = {
  getOverview: () => api.get('/analytics/overview'),
  getProductivity: () => api.get('/analytics/productivity'),
  getHabits: () => api.get('/analytics/habits'),
  getStreaks: () => api.get('/analytics/streaks'),
};

export default api;