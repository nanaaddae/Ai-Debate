import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const debateAPI = {
  getDebates: (params) => api.get('/debates/', { params }), // Now accepts search/filter params
  getDebate: (id) => api.get(`/debates/${id}`),
  createDebate: (data) => api.post('/debates/', data),
  voteOnDebate: (id, side) => api.post(`/debates/${id}/vote?side=${side}`),
   generateSummary: (id) => api.post(`/debates/${id}/generate-summary`),  // Add this

};

export const argumentAPI = {
  getDebateArguments: (debateId) => api.get(`/arguments/debates/${debateId}/arguments`),
  createArgument: (debateId, data) => api.post(`/arguments/debates/${debateId}/arguments`, data),
  voteOnArgument: (argumentId) => api.post(`/arguments/${argumentId}/vote`),
};

export const adminAPI = {
  // Debates
  getAllDebates: () => api.get('/admin/debates'),
  updateDebateStatus: (debateId, status) => api.patch(`/admin/debates/${debateId}/status`, null, {
    params: { new_status: status }
  }),
  deleteDebate: (debateId) => api.delete(`/admin/debates/${debateId}`),

  // Users
  getAllUsers: () => api.get('/admin/users'),
  updateUserRole: (userId, role) => api.patch(`/admin/users/${userId}/role`, null, {
    params: { new_role: role }
  }),
  toggleUserBan: (userId) => api.patch(`/admin/users/${userId}/ban`),

  // Stats
  getStats: () => api.get('/admin/stats'),
};

export const userAPI = {
  getProfile: (userId) => api.get(`/users/${userId}/profile`),
  getDebates: (userId, params) => api.get(`/users/${userId}/debates`, { params }),
  getArguments: (userId, params) => api.get(`/users/${userId}/arguments`, { params }),
  getActivity: (userId) => api.get(`/users/${userId}/activity`),
};


export const tagAPI = {
  getTags: () => api.get('/tags/'),
  getTag: (tagId) => api.get(`/tags/${tagId}`),
  getTagBySlug: (slug) => api.get(`/tags/slug/${slug}`),
  createTag: (data) => api.post('/tags/', data),
  deleteTag: (tagId) => api.delete(`/tags/${tagId}`),
};



export default api;