import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`);
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && original && !original._retry && !original.url?.includes('/auth/')) {
      original._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = refresh();
        }
        const newToken = await refreshPromise;
        refreshPromise = null;
        if (newToken) {
          original.headers.set('Authorization', `Bearer ${newToken}`);
          return api(original);
        }
      } catch {
        refreshPromise = null;
      }
    }
    return Promise.reject(error);
  },
);

async function refresh(): Promise<string | null> {
  try {
    const { data } = await axios.post(
      `${BASE_URL}/auth/refresh`,
      {},
      { withCredentials: true },
    );
    setAccessToken(data.accessToken);
    return data.accessToken;
  } catch {
    setAccessToken(null);
    return null;
  }
}
