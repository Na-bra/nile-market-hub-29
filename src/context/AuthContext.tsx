import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getStoredToken,
  getStoredUser,
  login as loginRequest,
  logout as clearSession,
  signup as signupRequest,
  type SignupPayload,
} from "../services/authService";
import type { User } from "../services/types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (payload: SignupPayload) => Promise<unknown>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
    setToken(getStoredToken());
    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
    };
    window.addEventListener("nile:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("nile:unauthorized", handleUnauthorized);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await loginRequest(email, password);
    setUser(res.user);
    setToken(res.token);
    return res.user;
  }, []);

  const signup = useCallback((payload: SignupPayload) => signupRequest(payload), []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    setToken(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: !!token,
      isAdmin: user?.role === "admin",
      login,
      signup,
      logout,
    }),
    [user, token, login, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
