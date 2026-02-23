import { create } from "zustand";
import type { User, Sport, AnalysisResult } from "@/types";
import { api, setTokens, clearTokens, ApiError } from "@/lib/api-client";
import { mapUserFromApi, roleToBackend } from "@/lib/mappers";
import type { ApiAuthResponse, ApiUser } from "@/types/api";

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  accessToken: string | null;

  // App
  currentSport: Sport;
  sidebarOpen: boolean;
  darkMode: boolean;
  selectedVideoId: string | null;
  activeAnalysis: AnalysisResult | null;
  selectedPlayers: string[];
  isAnalyzing: boolean;
  analysisProgress: number;

  // Auth actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    fullName: string;
    email: string;
    username: string;
    password: string;
    role: string;
    sport: string;
    organization?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;

  // App actions
  setUser: (user: User | null) => void;
  setSport: (sport: Sport) => void;
  toggleSidebar: () => void;
  setDarkMode: (dark: boolean) => void;
  setSelectedVideo: (id: string | null) => void;
  setActiveAnalysis: (analysis: AnalysisResult | null) => void;
  togglePlayerSelection: (playerId: string) => void;
  clearPlayerSelection: () => void;
  setIsAnalyzing: (analyzing: boolean) => void;
  setAnalysisProgress: (progress: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Auth initial state
  user: null,
  isAuthenticated: false,
  isAuthLoading: true,
  accessToken: null,

  // App initial state
  currentSport: "soccer",
  sidebarOpen: true,
  darkMode: true,
  selectedVideoId: null,
  activeAnalysis: null,
  selectedPlayers: [],
  isAnalyzing: false,
  analysisProgress: 0,

  // Auth actions
  login: async (email, password) => {
    const res = await api.post<ApiAuthResponse>("/auth/login", {
      email,
      password,
    });
    setTokens(res.accessToken, res.refreshToken);
    const user = mapUserFromApi(res.user);
    set({
      user,
      isAuthenticated: true,
      isAuthLoading: false,
      accessToken: res.accessToken,
      currentSport: user.sport || "soccer",
    });
  },

  register: async (data) => {
    const res = await api.post<ApiAuthResponse>("/auth/register", {
      fullName: data.fullName,
      email: data.email,
      username: data.username,
      password: data.password,
      role: roleToBackend(data.role as User["role"]),
      sport: data.sport?.toUpperCase(),
    });
    setTokens(res.accessToken, res.refreshToken);
    const user = mapUserFromApi(res.user);
    set({
      user,
      isAuthenticated: true,
      isAuthLoading: false,
      accessToken: res.accessToken,
      currentSport: user.sport || "soccer",
    });
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Ignore logout errors
    }
    clearTokens();
    set({
      user: null,
      isAuthenticated: false,
      isAuthLoading: false,
      accessToken: null,
    });
  },

  checkAuth: async () => {
    const refreshToken =
      typeof window !== "undefined"
        ? localStorage.getItem("refreshToken")
        : null;

    if (!refreshToken) {
      set({ isAuthLoading: false });
      return;
    }

    try {
      // Try to refresh the access token
      const refreshRes = await api.post<ApiAuthResponse>("/auth/refresh", {
        refreshToken,
      });
      setTokens(refreshRes.accessToken, refreshRes.refreshToken);

      // Get current user
      const userRes = await api.get<ApiUser>("/auth/me");
      const user = mapUserFromApi(userRes);

      set({
        user,
        isAuthenticated: true,
        isAuthLoading: false,
        accessToken: refreshRes.accessToken,
        currentSport: user.sport || "soccer",
      });
    } catch (err) {
      clearTokens();
      set({ isAuthLoading: false });
      if (err instanceof ApiError && err.status !== 401) {
        console.error("Auth check failed:", err.message);
      }
    }
  },

  // App actions
  setUser: (user) => set({ user }),
  setSport: (sport) => set({ currentSport: sport }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setDarkMode: (darkMode) => set({ darkMode }),
  setSelectedVideo: (id) => set({ selectedVideoId: id }),
  setActiveAnalysis: (analysis) => set({ activeAnalysis: analysis }),
  togglePlayerSelection: (playerId) =>
    set((s) => ({
      selectedPlayers: s.selectedPlayers.includes(playerId)
        ? s.selectedPlayers.filter((id) => id !== playerId)
        : [...s.selectedPlayers, playerId],
    })),
  clearPlayerSelection: () => set({ selectedPlayers: [] }),
  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  setAnalysisProgress: (analysisProgress) => set({ analysisProgress }),
}));
