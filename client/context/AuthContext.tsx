"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { clearToken, getToken, homePathForRole, setToken } from "@/lib/auth";
import type { ApiSuccess, User } from "@/types";

interface AuthResult {
  token: string;
  user: User;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Page reload par cookie se session restore
  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    api
      .get<ApiSuccess<{ user: User }>>("/auth/me")
      .then((res) => setUser(res.data.data.user))
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  const handleAuth = useCallback(
    (result: AuthResult) => {
      setToken(result.token);
      setUser(result.user);
      router.replace(homePathForRole(result.user.role));
    },
    [router]
  );

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api.post<ApiSuccess<AuthResult>>("/auth/login", { email, password });
      handleAuth(res.data.data);
    },
    [handleAuth]
  );

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await api.post<ApiSuccess<AuthResult>>("/auth/signup", { name, email, password });
      handleAuth(res.data.data);
    },
    [handleAuth]
  );

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    router.replace("/login");
  }, [router]);

  const value = useMemo(
    () => ({ user, loading, login, signup, logout }),
    [user, loading, login, signup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}