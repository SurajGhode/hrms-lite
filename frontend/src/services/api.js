import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

api.interceptors.response.use(
  res => res,
  err => {
    const msg = err.response?.data?.message || err.response?.data?.detail || err.message || 'Something went wrong';
    return Promise.reject({ ...err, friendlyMessage: msg, errors: err.response?.data?.errors });
  }
);

// Employees
export const employeeAPI = {
  list: (params = {}) => api.get('/employees/', { params }),
  get: (id) => api.get(`/employees/${id}/`),
  create: (data) => api.post('/employees/', data),
  update: (id, data) => api.put(`/employees/${id}/`, data),
  delete: (id) => api.delete(`/employees/${id}/`),
  getAttendance: (id, params = {}) => api.get(`/employees/${id}/attendance/`, { params }),
  getNextId: () => api.get('/employees/next-id/'),
};

// Attendance
export const attendanceAPI = {
  list: (params = {}) => api.get('/attendance/', { params }),
  get: (id) => api.get(`/attendance/${id}/`),
  create: (data) => api.post('/attendance/', data),
  update: (id, data) => api.put(`/attendance/${id}/`, data),
  delete: (id) => api.delete(`/attendance/${id}/`),
};

// Dashboard
export const dashboardAPI = {
  stats: () => api.get('/dashboard/'),
};

export default api;
