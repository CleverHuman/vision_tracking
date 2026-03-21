import { create } from "zustand";
import type { User, Sport, AnalysisResult } from "@/types";

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
  setAuth: (user: User, accessToken: string) => void;
  clearAuth: () => void;
  setAuthLoading: (loading: boolean) => void;

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
  setAuth: (user, accessToken) =>
    set({
      user,
      isAuthenticated: true,
      isAuthLoading: false,
      accessToken,
      currentSport: user.sport || "soccer",
    }),

  clearAuth: () =>
    set({
      user: null,
      isAuthenticated: false,
      isAuthLoading: false,
      accessToken: null,
    }),

  setAuthLoading: (isAuthLoading) => set({ isAuthLoading }),

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
