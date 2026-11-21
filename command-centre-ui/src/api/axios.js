import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL 
  ? `${import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, "")}/api/v1` 
  : "/api/v1";

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor — attach session token if available in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("command_centre_session");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("command_centre_session");
      const isAuthCheck = error.config?.url?.includes("/auth/me");
      if (!window.location.pathname.startsWith("/login") && !isAuthCheck) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
