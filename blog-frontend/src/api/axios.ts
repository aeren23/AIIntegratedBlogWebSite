import axios from 'axios';

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  errorMessage: string | null;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

let logoutHandler: (() => void) | null = null;

export const setLogoutHandler = (handler: () => void) => {
  logoutHandler = handler;
};

export const unwrapApiResponse = <T,>(response: ApiResponse<T>) => {
  if (!response.success) {
    throw new Error(response.errorMessage || 'Request failed');
  }
  return response.data;
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      logoutHandler?.();
    }
    return Promise.reject(error);
  }
);

export default api;
