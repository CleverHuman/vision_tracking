import { create } from "zustand";
import type { User, Sport, AnalysisResult } from "@/types";

interface AppState {
  user: User | null;
  currentSport: Sport;
  sidebarOpen: boolean;
  darkMode: boolean;
  selectedVideoId: string | null;
  activeAnalysis: AnalysisResult | null;
  selectedPlayers: string[];
  isAnalyzing: boolean;
  analysisProgress: number;

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
  user: {
    id: "user-1",
    name: "Marcus Thompson",
    email: "marcus@visiontrack.com",
    role: "coach",
    sport: "soccer",
    team: "Arsenal FC",
    avatar: undefined,
  },
  currentSport: "soccer",
  sidebarOpen: true,
  darkMode: true,
  selectedVideoId: null,
  activeAnalysis: null,
  selectedPlayers: [],
  isAnalyzing: false,
  analysisProgress: 0,

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
