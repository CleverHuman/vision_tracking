// =============================================================================
// Mappers — convert between backend API types and frontend types
// =============================================================================

import type {
  User,
  Video,
  Match,
  Player,
  PlayerStats,
  AnalysisResult,
  MatchEvent,
  HeatMapPoint,
  Highlight,
  Report,
  VideoCategory,
  AnalysisStatus,
  MatchResult,
  UserRole,
  Sport,
  AnalysisType,
} from "@/types";

import type {
  ApiUser,
  ApiVideo,
  ApiMatch,
  ApiPlayer,
  ApiPlayerStats,
  ApiAnalysisJob,
  ApiEvent,
  ApiHighlight,
  ApiReport,
  ApiHeatmapPoint,
  ApiNotification,
} from "@/types/api";

// ---------------------------------------------------------------------------
// Enum maps: Backend → Frontend
// ---------------------------------------------------------------------------

const roleMap: Record<string, UserRole> = {
  COACH: "coach",
  ANALYST: "analyst",
  ATHLETE: "athlete",
  SCOUT: "scout",
  MANAGER: "team_manager",
};

const videoCategoryMap: Record<string, VideoCategory> = {
  MATCH: "match",
  TRAINING: "training",
  DRILL: "drills",
  OPPONENT: "opponent",
  HIGHLIGHT: "highlights",
};

const videoStatusMap: Record<string, AnalysisStatus> = {
  PENDING: "unprocessed",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
};

const analysisStatusMap: Record<string, AnalysisStatus> = {
  QUEUED: "unprocessed",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
};

const matchResultMap: Record<string, MatchResult> = {
  WIN: "win",
  LOSS: "loss",
  DRAW: "draw",
};

const analysisTypeMap: Record<string, AnalysisType> = {
  FULL_MATCH: "full_match",
  PLAYER_TRACKING: "player_tracking",
  TACTICAL: "tactical",
  SET_PIECE: "set_piece",
  SCOUTING: "opponent_scouting",
  PERFORMANCE: "performance_review",
};

const eventTypeMap: Record<string, MatchEvent["type"]> = {
  GOAL: "goal",
  SHOT: "shot",
  PASS: "pass",
  TACKLE: "tackle",
  FOUL: "foul",
  SAVE: "save",
  SUBSTITUTION: "substitution",
  CARD: "card",
};

// ---------------------------------------------------------------------------
// Enum maps: Frontend → Backend
// ---------------------------------------------------------------------------

export function roleToBackend(role: UserRole): string {
  const map: Record<UserRole, string> = {
    coach: "COACH",
    analyst: "ANALYST",
    athlete: "ATHLETE",
    scout: "SCOUT",
    team_manager: "MANAGER",
  };
  return map[role] || role.toUpperCase();
}

export function videoCategoryToBackend(cat: VideoCategory): string {
  const map: Record<VideoCategory, string> = {
    match: "MATCH",
    training: "TRAINING",
    drills: "DRILL",
    opponent: "OPPONENT",
    highlights: "HIGHLIGHT",
  };
  return map[cat] || cat.toUpperCase();
}

export function analysisTypeToBackend(type: AnalysisType): string {
  const map: Record<AnalysisType, string> = {
    full_match: "FULL_MATCH",
    player_tracking: "PLAYER_TRACKING",
    tactical: "TACTICAL",
    set_piece: "SET_PIECE",
    opponent_scouting: "SCOUTING",
    performance_review: "PERFORMANCE",
  };
  return map[type] || type.toUpperCase();
}

export function reportTypeToBackend(
  type: Report["type"]
): string {
  const map: Record<Report["type"], string> = {
    pre_game: "PRE_MATCH",
    post_match: "POST_MATCH",
    player: "PLAYER",
    team: "TEAM",
    custom: "CUSTOM",
  };
  return map[type] || type.toUpperCase();
}

// ---------------------------------------------------------------------------
// Entity mappers: API → Frontend
// ---------------------------------------------------------------------------

export function mapUserFromApi(u: ApiUser): User {
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

export function mapVideoFromApi(v: ApiVideo): Video {
  return {
    id: v.id,
    title: v.title,
    description: v.description,
    thumbnail: v.thumbnailUrl || "/thumbnails/default.jpg",
    duration: v.duration || 0,
    category: videoCategoryMap[v.category] || "match",
    sport: (v.sport?.toLowerCase() as Sport) || "general",
    uploadDate: v.createdAt,
    analysisStatus: videoStatusMap[v.status] || "unprocessed",
    teams: v.team ? [v.team.name] : [],
    players: [],
    tags: v.tags || [],
    views: v.viewCount || 0,
    url: v.signedUrl || v.s3Url || "",
    matchId: v.matchId,
  };
}

export function mapMatchFromApi(m: ApiMatch): Match {
  // Compute analysis completion from jobs
  let analysisCompletion = 0;
  if (m.analysisJobs && m.analysisJobs.length > 0) {
    analysisCompletion = Math.round(
      m.analysisJobs.reduce((sum, j) => sum + j.progress, 0) /
        m.analysisJobs.length
    );
  }

  return {
    id: m.id,
    competition: m.competition,
    homeTeam: m.homeTeam,
    awayTeam: m.awayTeam,
    homeScore: m.homeScore,
    awayScore: m.awayScore,
    date: m.date,
    venue: m.venue || "",
    sport: m.sport.toLowerCase() as Sport,
    result: matchResultMap[m.result] || "draw",
    analysisCompletion,
    videoId: m.videoId,
    keyMetrics: {},
    thumbnail: m.video?.thumbnailUrl || "/thumbnails/default.jpg",
  };
}

export function mapPlayerFromApi(p: ApiPlayer, stats?: ApiPlayerStats): Player {
  const age = p.dateOfBirth
    ? Math.floor(
        (Date.now() - new Date(p.dateOfBirth).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
      )
    : 0;

  const sport = (p.team?.sport?.toLowerCase() as Sport) || "general";

  const playerStats: PlayerStats = stats
    ? {
        matchesPlayed: stats.matchesPlayed || 0,
        minutesPlayed: stats.minutesPlayed || 0,
        goals: stats.goals,
        assists: stats.assists,
        passAccuracy: stats.passAccuracy,
        distanceCovered: stats.totalDistance,
        topSpeed: stats.maxSpeed,
        sprintCount: stats.totalSprints,
        tackles: stats.tackles,
        interceptions: stats.interceptions,
      }
    : {
        matchesPlayed: 0,
        minutesPlayed: 0,
      };

  return {
    id: p.id,
    name: p.name,
    jerseyNumber: p.jerseyNumber,
    position: p.position,
    team: p.team?.name || "",
    sport,
    age,
    height: "",
    weight: "",
    nationality: p.nationality || "",
    avatar: p.avatarUrl || "/avatars/default.jpg",
    stats: playerStats,
    recentForm: [],
  };
}

export function mapAnalysisJobFromApi(j: ApiAnalysisJob): AnalysisResult {
  return {
    id: j.id,
    videoId: j.videoId,
    type: analysisTypeMap[j.type] || "full_match",
    status: analysisStatusMap[j.status] || "unprocessed",
    progress: j.progress,
    startedAt: j.startedAt || j.createdAt,
    completedAt: j.completedAt,
    detections: [],
    events: [],
    metrics: {},
    heatMapData: [],
  };
}

export function mapEventFromApi(e: ApiEvent): MatchEvent {
  return {
    id: e.id,
    type: eventTypeMap[e.type] || "pass",
    timestamp: e.timestamp,
    player: e.player?.name || e.playerId || undefined,
    team: e.teamName || "",
    description: e.description || "",
    position:
      e.positionX != null && e.positionY != null
        ? { x: e.positionX, y: e.positionY }
        : undefined,
  };
}

export function mapHighlightFromApi(h: ApiHighlight): Highlight {
  return {
    id: h.id,
    title: h.title,
    videoId: h.videoId,
    startTime: h.startTime,
    endTime: h.endTime,
    eventType: h.eventType || "clip",
    player: h.playerName,
    match: h.matchName,
    createdAt: h.createdAt,
    thumbnail: h.thumbnailUrl || h.signedUrl || "/thumbnails/default.jpg",
    tags: h.tags || [],
  };
}

export function mapReportFromApi(r: ApiReport): Report {
  const typeMap: Record<string, Report["type"]> = {
    PRE_MATCH: "pre_game",
    POST_MATCH: "post_match",
    PLAYER: "player",
    TEAM: "team",
    CUSTOM: "custom",
  };

  return {
    id: r.id,
    title: r.title,
    type: typeMap[r.type] || "custom",
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    matchId: r.matchId,
    status: r.status === "PUBLISHED" ? "published" : "draft",
    author: r.createdBy?.fullName || "",
    tags: r.tags || [],
  };
}

export function mapHeatmapFromApi(points: ApiHeatmapPoint[]): HeatMapPoint[] {
  return points.map((p) => ({
    x: p.x,
    y: p.y,
    intensity: p.intensity,
    playerId: p.playerId,
  }));
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  relatedId?: string;
  createdAt: string;
}

export function mapNotificationFromApi(n: ApiNotification): Notification {
  return {
    id: n.id,
    type: n.type,
    title: n.title,
    message: n.message,
    isRead: n.isRead,
    relatedId: n.relatedId,
    createdAt: n.createdAt,
  };
}
