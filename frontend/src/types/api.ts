// =============================================================================
// Raw API response types matching backend JSON shape
// =============================================================================

export interface ApiAuthResponse {
  user: ApiUser;
  accessToken: string;
  refreshToken: string;
}

export interface ApiUser {
  id: string;
  email: string;
  username: string;
  fullName: string;
  role: "COACH" | "ANALYST" | "ATHLETE" | "SCOUT" | "MANAGER";
  sport?: string;
  avatarUrl?: string;
  teamId?: string;
  team?: ApiTeam;
  createdAt: string;
  updatedAt: string;
}

export interface ApiTeam {
  id: string;
  name: string;
  sport: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  organizationId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiVideo {
  id: string;
  title: string;
  description?: string;
  s3Key: string;
  s3Url?: string;
  signedUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  category: "MATCH" | "TRAINING" | "DRILL" | "OPPONENT" | "HIGHLIGHT";
  sport?: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  tags: string[];
  viewCount: number;
  uploadedById: string;
  uploadedBy?: ApiUser;
  teamId?: string;
  team?: ApiTeam;
  matchId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiMatch {
  id: string;
  competition: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  date: string;
  venue?: string;
  sport: string;
  result: "WIN" | "LOSS" | "DRAW";
  teamId?: string;
  team?: ApiTeam;
  videoId?: string;
  video?: ApiVideo;
  analysisJobs?: ApiAnalysisJob[];
  events?: ApiEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiPlayer {
  id: string;
  name: string;
  jerseyNumber: number;
  position: string;
  dateOfBirth?: string;
  nationality?: string;
  avatarUrl?: string;
  isActive: boolean;
  teamId: string;
  team?: ApiTeam;
  createdAt: string;
  updatedAt: string;
}

export interface ApiPlayerStats {
  matchesPlayed: number;
  minutesPlayed: number;
  totalDistance: number;
  avgSpeed: number;
  maxSpeed: number;
  totalSprints: number;
  goals?: number;
  assists?: number;
  tackles?: number;
  interceptions?: number;
  passAccuracy?: number;
}

export interface ApiAnalysisJob {
  id: string;
  videoId: string;
  video?: ApiVideo;
  type: "FULL_MATCH" | "PLAYER_TRACKING" | "TACTICAL" | "SET_PIECE" | "SCOUTING" | "PERFORMANCE";
  status: "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED";
  progress: number;
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
  createdById: string;
  createdBy?: ApiUser;
  matchId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiEvent {
  id: string;
  type: "GOAL" | "SHOT" | "PASS" | "TACKLE" | "FOUL" | "SAVE" | "SUBSTITUTION" | "CARD";
  timestamp: number;
  description?: string;
  positionX?: number;
  positionY?: number;
  playerId?: string;
  player?: ApiPlayer;
  teamName?: string;
  matchId?: string;
  analysisJobId: string;
  createdAt: string;
}

export interface ApiPlayerTracking {
  id: string;
  playerId: string;
  player?: ApiPlayer;
  analysisJobId: string;
  frameNumber: number;
  timestamp: number;
  positionX: number;
  positionY: number;
  speed: number;
  distance: number;
  heatmapData?: Record<string, unknown>;
  createdAt: string;
}

export interface ApiHighlight {
  id: string;
  title: string;
  videoId: string;
  video?: ApiVideo;
  startTime: number;
  endTime: number;
  s3Key?: string;
  s3Url?: string;
  signedUrl?: string;
  thumbnailUrl?: string;
  eventType?: string;
  playerName?: string;
  matchName?: string;
  tags: string[];
  viewCount: number;
  isPublic: boolean;
  createdById: string;
  createdBy?: ApiUser;
  createdAt: string;
  updatedAt: string;
}

export interface ApiReport {
  id: string;
  title: string;
  type: "PRE_MATCH" | "POST_MATCH" | "PLAYER" | "TEAM" | "CUSTOM";
  content?: Record<string, unknown>;
  status: "DRAFT" | "PUBLISHED";
  matchId?: string;
  match?: ApiMatch;
  tags: string[];
  createdById: string;
  createdBy?: ApiUser;
  sharedWith?: ApiUser[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  userId: string;
  relatedId?: string;
  createdAt: string;
}

export interface ApiAnnotation {
  id: string;
  type: "DRAWING" | "TEXT" | "ARROW" | "ZONE";
  data: Record<string, unknown>;
  timestamp: number;
  videoId: string;
  createdById: string;
  createdBy?: ApiUser;
  createdAt: string;
  updatedAt: string;
}

export interface ApiHeatmapPoint {
  x: number;
  y: number;
  intensity: number;
  playerId?: string;
}

export interface ApiTeamStats {
  totalMatches: number;
  wins: number;
  losses: number;
  draws: number;
  goalsScored: number;
  goalsConceded: number;
}

export interface ApiPaginated<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
