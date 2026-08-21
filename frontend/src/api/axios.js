import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================
// Request interceptor — attach access token
// ============================================================
api.interceptors.request.use(
  (config) => {
    const tokens = JSON.parse(localStorage.getItem('tokens'));
    if (tokens?.access) {
      config.headers.Authorization = `Bearer ${tokens.access}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================================
// Response interceptor — auto-refresh expired access tokens
// ============================================================
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const tokens = JSON.parse(localStorage.getItem('tokens'));
        if (!tokens?.refresh) throw new Error('No refresh token');

        const { data } = await axios.post(`${API_URL}/auth/token/refresh/`, {
          refresh: tokens.refresh,
        });

        const newTokens = {
          access: data.access,
          refresh: data.refresh || tokens.refresh,
        };
        localStorage.setItem('tokens', JSON.stringify(newTokens));

        originalRequest.headers.Authorization = `Bearer ${newTokens.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('tokens');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
