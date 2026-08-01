import axios, { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';
import { tokenService } from '@/services/tokenService';
import type { ApiResponse, ApiClientError, AuthTokens } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // send the httpOnly refresh-token cookie
  timeout: 20000,
});

// --- Request interceptor: attach the access token ---
apiClient.interceptors.request.use((config) => {
  const token = tokenService.getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Response interceptor: normalize errors + auto-refresh on 401 ---

let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

function subscribeToRefresh(cb: (token: string | null) => void) {
  refreshQueue.push(cb);
}

function notifyRefreshSubscribers(token: string | null) {
  refreshQueue.forEach((cb) => cb(token));
  refreshQueue = [];
}

/** Called when a refresh fails outright — clears session and lets the app redirect to /login. */
let onSessionExpired: (() => void) | null = null;
export function registerSessionExpiredHandler(handler: () => void) {
  onSessionExpired = handler;
}

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse>) => {
    const originalRequest = error.config as RetryableConfig | undefined;
    const status = error.response?.status;

    const isAuthEndpoint =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/register') ||
      originalRequest?.url?.includes('/auth/refresh');

    if (status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        // Queue this request until the in-flight refresh resolves
        return new Promise((resolve, reject) => {
          subscribeToRefresh((newToken) => {
            if (!newToken) return reject(error);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = tokenService.getRefreshToken();
        const { data } = await axios.post<ApiResponse<AuthTokens>>(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken },
          { withCredentials: true }
        );

        const newAccessToken = data.data?.accessToken;
        const newRefreshToken = data.data?.refreshToken;
        if (!newAccessToken || !newRefreshToken) throw new Error('Refresh response missing tokens');

        tokenService.setTokens(newAccessToken, newRefreshToken);
        notifyRefreshSubscribers(newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        notifyRefreshSubscribers(null);
        tokenService.clear();
        onSessionExpired?.();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const normalized: ApiClientError = {
      message: error.response?.data?.message || error.message || 'An error occurred',
      statusCode: status || 0,
      errors: error.response?.data?.errors || null,
    };

    return Promise.reject(normalized);
  }
);

/** Typed helper so callers get `data.data` directly instead of unwrapping the envelope every time. */
export async function apiRequest<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.request<ApiResponse<T>>(config);
  return response.data.data as T;
}

/** Variant that returns the full envelope, for callers that also need `pagination` or `message`. */
export async function apiRequestFull<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
  const response = await apiClient.request<ApiResponse<T>>(config);
  return response.data;
}
