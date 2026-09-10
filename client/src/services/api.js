import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 responses — auto logout
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try refresh token
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken && !error.config._retry) {
        error.config._retry = true;
        try {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
          localStorage.setItem('accessToken', data.data.accessToken);
          localStorage.setItem('refreshToken', data.data.refreshToken);
          error.config.headers.Authorization = `Bearer ${data.data.accessToken}`;
          return api(error.config);
        } catch {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ─── Auth Service ────────────────────────────────────
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// ─── Event Service ───────────────────────────────────
export const eventService = {
  create: (data) => api.post('/events', data),
  getAll: () => api.get('/events'),
  getOne: (id) => api.get(`/events/${id}`),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
  addMember: (eventId, data) => api.post(`/events/${eventId}/members`, data),
  removeMember: (eventId, userId) => api.delete(`/events/${eventId}/members/${userId}`),
};

// ─── Photo Service ───────────────────────────────────
export const photoService = {
  upload: (eventId, formData, onProgress) =>
    api.post(`/events/${eventId}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress) {
          onProgress(Math.round((e.loaded * 100) / e.total));
        }
      },
    }),
  getAll: (eventId, params = {}) => api.get(`/events/${eventId}/photos`, { params }),
  select: (eventId, photoIds, selected) =>
    api.patch(`/events/${eventId}/photos/select`, { photoIds, selected }),
  delete: (eventId, photoId) => api.delete(`/events/${eventId}/photos/${photoId}`),
};

// ─── Gallery Service ─────────────────────────────────
export const galleryService = {
  create: (eventId, data) => api.post(`/events/${eventId}/gallery`, data),
  publish: (eventId, published = true) =>
    api.put(`/events/${eventId}/gallery/publish`, { published }),
  getAdmin: (eventId) => api.get(`/events/${eventId}/gallery`),

  // Public (no auth needed)
  getPublic: (slug) => axios.get(`${API_URL}/gallery/${slug}`),
  verifyPin: (slug, pin) => axios.post(`${API_URL}/gallery/${slug}/verify`, { pin }),
  getPhotos: (slug, galleryToken, params = {}) =>
    axios.get(`${API_URL}/gallery/${slug}/photos`, {
      params,
      headers: { Authorization: `Gallery ${galleryToken}` },
    }),
};
