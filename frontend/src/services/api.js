import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('codesphere_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('codesphere_token');
      localStorage.removeItem('codesphere_user');
      // Only redirect if not already on auth pages
      if (!window.location.pathname.startsWith('/login') &&
          !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth API ──────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updatePreferences: (data) => api.put('/auth/preferences', data),
};

// ─── Code Execution API ───────────────────────────────────
export const codeAPI = {
  execute: (data) => api.post('/code/execute', data),
  getLanguages: () => api.get('/code/languages'),
};

// ─── Snippets API ─────────────────────────────────────────
export const snippetsAPI = {
  create: (data) => api.post('/snippets', data),
  getAll: (params) => api.get('/snippets', { params }),
  getOne: (id) => api.get(`/snippets/${id}`),
  update: (id, data) => api.put(`/snippets/${id}`, data),
  delete: (id) => api.delete(`/snippets/${id}`),
  toggleBookmark: (id) => api.patch(`/snippets/${id}/bookmark`),
};

// ─── Executions API ───────────────────────────────────────
export const executionsAPI = {
  getHistory: (params) => api.get('/executions', { params }),
  getOne: (id) => api.get(`/executions/${id}`),
  getStats: () => api.get('/executions/stats/summary'),
};

// ─── Health API ───────────────────────────────────────────
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;
