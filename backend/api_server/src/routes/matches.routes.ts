import 'express-async-errors';
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate } from '../config/auth.middleware';
import { validate } from '../config/validate.middleware';
import { AppError } from '../config/error.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// ─── Zod Schemas ────────────────────────────────────────────────────────────────

const MatchResult = z.enum(['WIN', 'LOSS', 'DRAW']);

const createMatchSchema = z.object({
  homeTeam: z.string().min(1, 'Home team is required'),
  awayTeam: z.string().min(1, 'Away team is required'),
  date: z.string().datetime({ message: 'Invalid ISO date string' }).transform((val) => new Date(val)),
  venue: z.string().optional(),
  competition: z.string().optional(),
  season: z.string().optional(),
  sport: z.string().min(1, 'Sport is required'),
  weather: z.string().optional(),
  result: MatchResult.optional(),
  teamId: z.string().uuid('Invalid team ID'),
});

const updateMatchSchema = z.object({
  homeTeam: z.string().min(1, 'Home team cannot be empty').optional(),
  awayTeam: z.string().min(1, 'Away team cannot be empty').optional(),
  homeScore: z.number().int().min(0).optional(),
  awayScore: z.number().int().min(0).optional(),
  date: z
    .string()
    .datetime({ message: 'Invalid ISO date string' })
    .transform((val) => new Date(val))
    .optional(),
  venue: z.string().optional(),
  competition: z.string().optional(),
  season: z.string().optional(),
  weather: z.string().optional(),
  result: MatchResult.optional(),
});

// ─── POST / — Create match ──────────────────────────────────────────────────────

router.post(
  '/',
  validate({ body: createMatchSchema }),
  async (req: Request, res: Response) => {
    const { homeTeam, awayTeam, date, venue, competition, season, sport, weather, result, teamId } =
      req.body;

    // Verify team exists
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new AppError(404, 'Team not found');
    }

    const match = await prisma.match.create({
      data: {
        homeTeam,
        awayTeam,
        date,
        venue,
        competition,
        season,
        sport,
        weather,
        result,
        teamId,
      },
    });

    res.status(201).json(match);
  },
);

// ─── GET / — List matches ───────────────────────────────────────────────────────

router.get('/', async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string, 10) || 20));
  const skip = (page - 1) * limit;

  const { season, competition, result, teamId, sport, opponent, dateFrom, dateTo } = req.query as {
    season?: string;
    competition?: string;
    result?: string;
    teamId?: string;
    sport?: string;
    opponent?: string;
    dateFrom?: string;
    dateTo?: string;
  };

  const where: Record<string, unknown> = {
    deletedAt: null,
  };

  if (season) {
    where.season = season;
  }

  if (competition) {
    where.competition = competition;
  }

  if (result) {
    where.result = result;
  }

  if (teamId) {
    where.teamId = teamId;
  }

  if (sport) {
    where.sport = sport;
  }

  if (opponent) {
    where.OR = [
      { homeTeam: { contains: opponent, mode: 'insensitive' } },
      { awayTeam: { contains: opponent, mode: 'insensitive' } },
    ];
  }

  if (dateFrom || dateTo) {
    const dateFilter: Record<string, Date> = {};
    if (dateFrom) dateFilter.gte = new Date(dateFrom);
    if (dateTo) dateFilter.lte = new Date(dateTo);
    where.date = dateFilter;
  }

  const [data, total] = await Promise.all([
    prisma.match.findMany({
      where,
      include: {
        team: { select: { id: true, name: true } },
        video: { select: { id: true, title: true, status: true } },
      },
      skip,
      take: limit,
      orderBy: { date: 'desc' },
    }),
    prisma.match.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    data,
    total,
    page,
    totalPages,
  });
});

// ─── GET /season-comparison — Stats grouped by season ───────────────────────────

router.get('/season-comparison', async (req: Request, res: Response) => {
  const { teamId } = req.query as { teamId?: string };

  if (!teamId) {
    throw new AppError(400, 'teamId query parameter is required');
  }

  // Verify team exists
  const team = await prisma.team.findUnique({
    where: { id: teamId },
  });

  if (!team) {
    throw new AppError(404, 'Team not found');
  }

  const matches = await prisma.match.findMany({
    where: { teamId, deletedAt: null },
    select: {
      season: true,
      result: true,
      homeTeam: true,
      homeScore: true,
      awayScore: true,
    },
  });

  // Group by season
  const seasonMap = new Map<
    string,
    {
      matchCount: number;
      wins: number;
      losses: number;
      draws: number;
      goalsScored: number;
      goalsConceded: number;
    }
  >();

  for (const match of matches) {
    const seasonKey = match.season || 'Unknown';

    if (!seasonMap.has(seasonKey)) {
      seasonMap.set(seasonKey, {
        matchCount: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        goalsScored: 0,
        goalsConceded: 0,
      });
    }

    const stats = seasonMap.get(seasonKey)!;
    stats.matchCount += 1;

    if (match.result === 'WIN') stats.wins += 1;
    if (match.result === 'LOSS') stats.losses += 1;
    if (match.result === 'DRAW') stats.draws += 1;

    const isHome = match.homeTeam === team.name;
    const home = match.homeScore ?? 0;
    const away = match.awayScore ?? 0;

    if (isHome) {
      stats.goalsScored += home;
      stats.goalsConceded += away;
    } else {
      stats.goalsScored += away;
      stats.goalsConceded += home;
    }
  }

  const seasons = Array.from(seasonMap.entries()).map(([season, stats]) => ({
    season,
    ...stats,
    avgGoalsScored: stats.matchCount > 0 ? +(stats.goalsScored / stats.matchCount).toFixed(2) : 0,
    avgGoalsConceded:
      stats.matchCount > 0 ? +(stats.goalsConceded / stats.matchCount).toFixed(2) : 0,
  }));

  res.status(200).json({ seasons });
});

// ─── GET /:id — Get match ───────────────────────────────────────────────────────

router.get('/:id', async (req: Request, res: Response) => {
  const match = await prisma.match.findUnique({
    where: { id: req.params.id },
    include: {
      team: true,
      video: true,
      analysisJobs: { select: { id: true, type: true, status: true } },
      events: { orderBy: { timestamp: 'asc' } },
      highlights: true,
      reports: { select: { id: true, title: true, type: true } },
    },
  });

  if (!match || match.deletedAt !== null) {
    throw new AppError(404, 'Match not found');
  }

  res.status(200).json(match);
});

// ─── PATCH /:id — Update match ──────────────────────────────────────────────────

router.patch(
  '/:id',
  validate({ body: updateMatchSchema }),
  async (req: Request, res: Response) => {
    const existingMatch = await prisma.match.findUnique({
      where: { id: req.params.id },
    });

    if (!existingMatch || existingMatch.deletedAt !== null) {
      throw new AppError(404, 'Match not found');
    }

    const { homeTeam, awayTeam, homeScore, awayScore, date, venue, competition, season, weather, result } =
      req.body;

    const updateData: Record<string, unknown> = {};

    if (homeTeam !== undefined) updateData.homeTeam = homeTeam;
    if (awayTeam !== undefined) updateData.awayTeam = awayTeam;
    if (homeScore !== undefined) updateData.homeScore = homeScore;
    if (awayScore !== undefined) updateData.awayScore = awayScore;
    if (date !== undefined) updateData.date = date;
    if (venue !== undefined) updateData.venue = venue;
    if (competition !== undefined) updateData.competition = competition;
    if (season !== undefined) updateData.season = season;
    if (weather !== undefined) updateData.weather = weather;
    if (result !== undefined) updateData.result = result;

    const updatedMatch = await prisma.match.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.status(200).json(updatedMatch);
  },
);

// ─── DELETE /:id — Soft delete ──────────────────────────────────────────────────

router.delete('/:id', async (req: Request, res: Response) => {
  const match = await prisma.match.findUnique({
    where: { id: req.params.id },
  });

  if (!match || match.deletedAt !== null) {
    throw new AppError(404, 'Match not found');
  }

  await prisma.match.update({
    where: { id: req.params.id },
    data: { deletedAt: new Date() },
  });

  res.status(200).json({ message: 'Match deleted' });
});

// ─── GET /:id/events — All events for match ────────────────────────────────────

router.get('/:id/events', async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string, 10) || 20));
  const skip = (page - 1) * limit;

  const { type, playerIdFilter } = req.query as {
    type?: string;
    playerIdFilter?: string;
  };

  // Verify match exists
  const match = await prisma.match.findUnique({
    where: { id: req.params.id },
  });

  if (!match || match.deletedAt !== null) {
    throw new AppError(404, 'Match not found');
  }

  const where: Record<string, unknown> = {
    matchId: req.params.id,
  };

  if (type) {
    where.type = type;
  }

  if (playerIdFilter) {
    where.playerId = playerIdFilter;
  }

  const [data, total] = await Promise.all([
    prisma.event.findMany({
      where,
      include: {
        player: { select: { id: true, name: true } },
      },
      skip,
      take: limit,
      orderBy: { timestamp: 'asc' },
    }),
    prisma.event.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    data,
    total,
    page,
    totalPages,
  });
});

// ─── GET /:id/analysis — Full analysis result ──────────────────────────────────

router.get('/:id/analysis', async (req: Request, res: Response) => {
  // Verify match exists
  const match = await prisma.match.findUnique({
    where: { id: req.params.id },
  });

  if (!match || match.deletedAt !== null) {
    throw new AppError(404, 'Match not found');
  }

  const results = await prisma.analysisJob.findMany({
    where: {
      matchId: req.params.id,
      status: 'COMPLETED',
    },
    select: {
      id: true,
      type: true,
      status: true,
      resultData: true,
      startedAt: true,
      completedAt: true,
      playerTrackings: true,
      events: true,
    },
    orderBy: { completedAt: 'desc' },
  });

  res.status(200).json(results);
});

export default router;
