import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "https://thumbforge-ai.onrender.com/api/";
const UPLOADS_BASE = import.meta.env.VITE_UPLOADS_URL || "https://thumbforge-ai.onrender.com/";

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && token !== "undefined") {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  register: (data: { name: string; email: string; password: string; country: string }) =>
    api.post("auth/register", data),
  login: (data: { email: string; password: string }) =>
    api.post("auth/login", data),
  forgotPassword: (data: { email: string }) =>
    api.post("auth/forgot-password", data),
  resetPassword: (token: string, data: { password: string }) =>
    api.post(`auth/reset-password/${token}`, data),
};

// Thumbnails
export const thumbnailApi = {
  getAll: () => api.get("thumbnails"),
  create: (formData: FormData) =>
    api.post("thumbnails", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id: string, data: { videoName?: string; version?: string; paid?: boolean }) =>
    api.put(`thumbnails/${id}`, data),
  delete: (id: string) => api.delete(`thumbnails/${id}`),
  bulkDelete: (ids: string[]) => api.delete("thumbnails", { data: { ids } }),
};

export { UPLOADS_BASE };
export default api;
