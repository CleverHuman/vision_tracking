import { useCallback } from "react";
import { useAppStore } from "@/store/app-store";
import type { User, Sport } from "@/types";

const API_BASE = "/api";

interface AuthResponse {
  user: {
    id: string;
    email: string;
    username: string;
    fullName: string;
    role: string;
    sport?: string;
    avatarUrl?: string;
    teamId?: string;
    team?: { name: string; sport: string };
    createdAt: string;
    updatedAt: string;
  };
  accessToken: string;
  refreshToken: string;
}

const roleMap: Record<string, User["role"]> = {
  COACH: "coach",
  ANALYST: "analyst",
  ATHLETE: "athlete",
  SCOUT: "scout",
  MANAGER: "team_manager",
};

function mapUser(u: AuthResponse["user"]): User {
  return {
    id: u.id,
    name: u.fullName,
    email: u.email,
    role: roleMap[u.role] || "coach",
    sport: (u.sport?.toLowerCase() as Sport) || (u.team?.sport?.toLowerCase() as Sport) || "general",
    team: u.team?.name || "",
    teamId: u.teamId,
    avatar: u.avatarUrl,
  };
}

function roleToBackend(role: string): string {
  const map: Record<string, string> = {
    coach: "COACH",
    analyst: "ANALYST",
    athlete: "ATHLETE",
    scout: "SCOUT",
    team_manager: "MANAGER",
  };
  return map[role] || role.toUpperCase();
}

export function useAuth() {
  const user = useAppStore((s) => s.user);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const isAuthLoading = useAppStore((s) => s.isAuthLoading);
  const setAuth = useAppStore((s) => s.setAuth);
  const clearAuth = useAppStore((s) => s.clearAuth);
  const setAuthLoading = useAppStore((s) => s.setAuthLoading);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Login failed");
      }
      const data: AuthResponse = await res.json();
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("accessToken", data.accessToken);
      setAuth(mapUser(data.user), data.accessToken);
    },
    [setAuth]
  );

  const register = useCallback(
    async (input: {
      fullName: string;
      email: string;
      username: string;
      password: string;
      role: string;
      sport: string;
      organization?: string;
    }) => {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: input.fullName,
          email: input.email,
          username: input.username,
          password: input.password,
          role: roleToBackend(input.role),
          sport: input.sport?.toUpperCase(),
        }),
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Registration failed");
      }
      const data: AuthResponse = await res.json();
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("accessToken", data.accessToken);
      setAuth(mapUser(data.user), data.accessToken);
    },
    [setAuth]
  );

  const logout = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });
    } catch {
      // ignore
    }
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("accessToken");
    clearAuth();
  }, [clearAuth]);

  const checkAuth = useCallback(async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      setAuthLoading(false);
      return;
    }
    try {
      const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
        credentials: "include",
      });
      if (!refreshRes.ok) throw new Error("Refresh failed");
      const refreshData: AuthResponse = await refreshRes.json();
      localStorage.setItem("refreshToken", refreshData.refreshToken);
      localStorage.setItem("accessToken", refreshData.accessToken);

      const meRes = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${refreshData.accessToken}` },
        credentials: "include",
      });
      if (!meRes.ok) throw new Error("Auth check failed");
      const meData = await meRes.json();
      setAuth(mapUser(meData.user), refreshData.accessToken);
    } catch {
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("accessToken");
      setAuthLoading(false);
    }
  }, [setAuth, setAuthLoading]);

  return { user, isAuthenticated, isAuthLoading, login, register, logout, checkAuth };
}
