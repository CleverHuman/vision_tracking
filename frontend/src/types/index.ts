export type Sport = "soccer" | "basketball" | "baseball" | "tennis" | "hockey" | "volleyball" | "rugby" | "general";
export type UserRole = "coach" | "analyst" | "athlete" | "scout" | "team_manager";
export type AnalysisStatus = "unprocessed" | "processing" | "completed" | "failed";
export type VideoCategory = "match" | "training" | "drills" | "opponent" | "highlights";
export type MatchResult = "win" | "loss" | "draw";
export type FormationName = "4-3-3" | "4-4-2" | "3-5-2" | "4-2-3-1" | "3-4-3" | "5-3-2" | "4-1-4-1";
export type AnalysisType = "full_match" | "player_tracking" | "tactical" | "set_piece" | "opponent_scouting" | "performance_review";
export type PhaseOfPlay = "attack" | "defense" | "transition_attack" | "transition_defense";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  sport: Sport;
  team: string;
  teamId?: string;
  avatar?: string;
}

export interface Video {
  id: string;
  title: string;
  description?: string;
  thumbnail: string;
  duration: number;
  category: VideoCategory;
  sport: Sport;
  uploadDate: string;
  analysisStatus: AnalysisStatus;
  teams: string[];
  players: string[];
  tags: string[];
  views: number;
  url: string;
  matchId?: string;
}

export interface Match {
  id: string;
  competition: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  date: string;
  venue: string;
  sport: Sport;
  result: MatchResult;
  analysisCompletion: number;
  videoId?: string;
  keyMetrics: Record<string, number>;
  thumbnail: string;
}

export interface Player {
  id: string;
  name: string;
  jerseyNumber: number;
  position: string;
  team: string;
  sport: Sport;
  age: number;
  height: string;
  weight: string;
  nationality: string;
  avatar: string;
  stats: PlayerStats;
  recentForm: number[];
}

export interface PlayerStats {
  matchesPlayed: number;
  minutesPlayed: number;
  goals?: number;
  assists?: number;
  passAccuracy?: number;
  distanceCovered?: number;
  topSpeed?: number;
  sprintCount?: number;
  tackles?: number;
  interceptions?: number;
  shotsOnTarget?: number;
  xG?: number;
  points?: number;
  rebounds?: number;
  steals?: number;
  blocks?: number;
  fieldGoalPct?: number;
  threePointPct?: number;
  battingAverage?: number;
  homeRuns?: number;
  rbi?: number;
  era?: number;
  firstServePct?: number;
  aces?: number;
  winners?: number;
  unforcedErrors?: number;
}

export interface AnalysisResult {
  id: string;
  videoId: string;
  type: AnalysisType;
  status: AnalysisStatus;
  progress: number;
  startedAt: string;
  completedAt?: string;
  detections: Detection[];
  events: MatchEvent[];
  metrics: Record<string, number>;
  heatMapData: HeatMapPoint[];
}

export interface Detection {
  id: string;
  type: "player" | "ball" | "referee";
  label: string;
  jerseyNumber?: number;
  team?: string;
  confidence: number;
  timestamp: number;
  bbox: { x: number; y: number; width: number; height: number };
}

export interface MatchEvent {
  id: string;
  type: "goal" | "shot" | "pass" | "foul" | "corner" | "offside" | "substitution" | "card" | "save" | "tackle" | "turnover";
  timestamp: number;
  player?: string;
  team: string;
  description: string;
  position?: { x: number; y: number };
}

export interface HeatMapPoint {
  x: number;
  y: number;
  intensity: number;
  playerId?: string;
}

export interface TacticalFormation {
  name: FormationName;
  positions: { x: number; y: number; role: string; playerId?: string }[];
}

export interface Report {
  id: string;
  title: string;
  type: "pre_game" | "post_match" | "player" | "team" | "custom";
  createdAt: string;
  updatedAt: string;
  matchId?: string;
  status: "draft" | "published";
  author: string;
  tags: string[];
}

export interface Highlight {
  id: string;
  title: string;
  videoId: string;
  startTime: number;
  endTime: number;
  eventType: string;
  player?: string;
  match?: string;
  createdAt: string;
  thumbnail: string;
  tags: string[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: "match" | "training" | "analysis" | "meeting";
  date: string;
  time: string;
  venue?: string;
  opponent?: string;
}

export interface ActivityItem {
  id: string;
  type: "upload" | "analysis" | "highlight" | "annotation" | "report" | "share";
  description: string;
  user: string;
  timestamp: string;
  relatedId?: string;
}
