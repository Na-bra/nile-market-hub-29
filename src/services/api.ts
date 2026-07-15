import axios, { AxiosError, type AxiosInstance } from "axios";

// Base URL comes from the live backend documented in swagger.
// Override via VITE_API_URL if pointing at a different environment.
const BASE_URL =
  (import.meta as { env?: Record<string, string> }).env?.VITE_API_URL ??
  "https://nilemarket-hbum.onrender.com";

export const TOKEN_KEY = "nile.token";
export const USER_KEY = "nile.user";

export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error: AxiosError<{ message?: string; error?: string }>) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      // Token invalid/expired — wipe local session; UI reacts via AuthContext.
      window.localStorage.removeItem(TOKEN_KEY);
      window.localStorage.removeItem(USER_KEY);
      window.dispatchEvent(new Event("nile:unauthorized"));
    }
    return Promise.reject(error);
  },
);

/** Extracts the backend-provided error message; never invents one. */
export function extractError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as
      | { message?: string; error?: string }
      | string
      | undefined;
    if (typeof data === "string") return data;
    if (data?.message) return data.message;
    if (data?.error) return data.error;
    return err.message;
  }
  if (err instanceof Error) return err.message;
  return "Request failed";
}
