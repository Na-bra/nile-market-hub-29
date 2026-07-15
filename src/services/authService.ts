import { api, TOKEN_KEY, USER_KEY } from "./api";
import type { User } from "./types";

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

export interface SignupPayload {
  fullName: string;
  email: string;
  matricNumber: string;
  department: string;
  level: number | string;
  phoneNumber: number | string;
  whatsappNumber?: number | string;
  password: string;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/api/auth/login", { email, password });
  if (typeof window !== "undefined") {
    window.localStorage.setItem(TOKEN_KEY, data.token);
    window.localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  }
  return data;
}

export async function signup(payload: SignupPayload): Promise<unknown> {
  const { data } = await api.post("/api/auth/signup", payload);
  return data;
}

export function logout() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

// NOTE: The backend does not expose a GET /api/auth/me endpoint.
// The frontend relies on the user object returned by /api/auth/login.
// TODO(backend): expose /api/auth/me to re-hydrate the current user from a token.
