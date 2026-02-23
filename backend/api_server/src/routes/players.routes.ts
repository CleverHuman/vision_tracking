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

const createPlayerSchema = z.object({
  name: z.string().min(1, 'Player name is required'),
  jerseyNumber: z.number().int('Jersey number must be an integer'),
  position: z.string().min(1, 'Position is required'),
  teamId: z.string().uuid('Invalid team ID'),
  dateOfBirth: z.string().datetime().optional(),
  nationality: z.string().optional(),
  avatarUrl: z.string().url('Invalid avatar URL').optional(),
});

const updatePlayerSchema = z.object({
  name: z.string().min(1, 'Player name cannot be empty').optional(),
  jerseyNumber: z.number().int('Jersey number must be an integer').optional(),
  position: z.string().min(1, 'Position cannot be empty').optional(),
  dateOfBirth: z.string().datetime().optional(),
  nationality: z.string().optional(),
  avatarUrl: z.string().url('Invalid avatar URL').optional(),
  isActive: z.boolean().optional(),
  stats: z.any().optional(),
});

const comparePlayersSchema = z.object({
  playerIds: z
    .array(z.string().uuid('Invalid player ID'))
    .min(2, 'At least 2 player IDs are required'),
});

// ─── Helper: Aggregate player stats ─────────────────────────────────────────────

async function getPlayerStats(playerId: string) {
  const [trackingAgg, sprintAgg, topSpeedAgg, eventCounts] = await Promise.all([
    prisma.playerTracking.aggregate({
      where: { playerId },
      _avg: { distanceCovered: true },
      _sum: { distanceCovered: true },
      _count: { id: true },
    }),
    prisma.playerTracking.aggregate({
      where: { playerId },
      _sum: { sprintCount: true },
    }),
    prisma.playerTracking.aggregate({
      where: { playerId },
      _max: { topSpeed: true },
    }),
    prisma.event.groupBy({
      by: ['type'],
      where: { playerId },
      _count: { id: true },
    }),
  ]);

  const events: Record<string, number> = {};
  for (const entry of eventCounts) {
    events[entry.type] = entry._count.id;
  }

  return {
    tracking: {
      totalSessions: trackingAgg._count.id,
      avgDistanceCovered: trackingAgg._avg.distanceCovered,
      totalDistanceCovered: trackingAgg._sum.distanceCovered,
      topSpeed: topSpeedAgg._max.topSpeed,
      totalSprintCount: sprintAgg._sum.sprintCount,
    },
    events,
  };
}

// ─── POST /compare — Compare players ────────────────────────────────────────────

router.post(
  '/compare',
  validate({ body: comparePlayersSchema }),
  async (req: Request, res: Response) => {
    const { playerIds } = req.body;

    const players = await prisma.player.findMany({
      where: { id: { in: playerIds }, deletedAt: null },
      include: { team: { select: { name: true, sport: true } } },
    });

    if (players.length !== playerIds.length) {
      const foundIds = players.map((p) => p.id);
      const missing = playerIds.filter((id: string) => !foundIds.includes(id));
      throw new AppError(404, `Players not found: ${missing.join(', ')}`);
    }

    const results = await Promise.all(
      players.map(async (player) => {
        const stats = await getPlayerStats(player.id);
        return { player, stats };
      }),
    );

    res.status(200).json({ players: results });
  },
);

// ─── POST / — Create player ─────────────────────────────────────────────────────

router.post(
  '/',
  validate({ body: createPlayerSchema }),
  async (req: Request, res: Response) => {
    const { name, jerseyNumber, position, teamId, dateOfBirth, nationality, avatarUrl } = req.body;

    // Verify team exists
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new AppError(404, 'Team not found');
    }

    const player = await prisma.player.create({
      data: {
        name,
        jerseyNumber,
        position,
        teamId,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        nationality,
        avatarUrl,
      },
    });

    res.status(201).json(player);
  },
);

// ─── GET / — List players ───────────────────────────────────────────────────────

router.get('/', async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string, 10) || 20));
  const skip = (page - 1) * limit;

  const { teamId, position, isActive, search, nationality } = req.query as {
    teamId?: string;
    position?: string;
    isActive?: string;
    search?: string;
    nationality?: string;
  };

  const where: Record<string, unknown> = {
    deletedAt: null,
  };

  if (teamId) {
    where.teamId = teamId;
  }

  if (position) {
    where.position = position;
  }

  if (isActive !== undefined) {
    where.isActive = isActive === 'true';
  }

  if (search) {
    where.name = { contains: search, mode: 'insensitive' };
  }

  if (nationality) {
    where.nationality = nationality;
  }

  const [data, total] = await Promise.all([
    prisma.player.findMany({
      where,
      include: {
        team: { select: { name: true, sport: true } },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.player.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    data,
    total,
    page,
    totalPages,
  });
});

// ─── GET /:id — Get player ──────────────────────────────────────────────────────

router.get('/:id', async (req: Request, res: Response) => {
  const player = await prisma.player.findUnique({
    where: { id: req.params.id },
    include: {
      team: true,
      playerTrackings: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
      events: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  if (!player || player.deletedAt !== null) {
    throw new AppError(404, 'Player not found');
  }

  res.status(200).json(player);
});

// ─── PATCH /:id — Update player ─────────────────────────────────────────────────

router.patch(
  '/:id',
  validate({ body: updatePlayerSchema }),
  async (req: Request, res: Response) => {
    const existingPlayer = await prisma.player.findUnique({
      where: { id: req.params.id },
    });

    if (!existingPlayer || existingPlayer.deletedAt !== null) {
      throw new AppError(404, 'Player not found');
    }

    const { name, jerseyNumber, position, dateOfBirth, nationality, avatarUrl, isActive, stats } =
      req.body;

    const updateData: Record<string, unknown> = {};

    if (name !== undefined) updateData.name = name;
    if (jerseyNumber !== undefined) updateData.jerseyNumber = jerseyNumber;
    if (position !== undefined) updateData.position = position;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = new Date(dateOfBirth);
    if (nationality !== undefined) updateData.nationality = nationality;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (stats !== undefined) updateData.stats = stats;

    const updatedPlayer = await prisma.player.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.status(200).json(updatedPlayer);
  },
);

// ─── DELETE /:id — Soft delete ───────────────────────────────────────────────────

router.delete('/:id', async (req: Request, res: Response) => {
  const existingPlayer = await prisma.player.findUnique({
    where: { id: req.params.id },
  });

  if (!existingPlayer || existingPlayer.deletedAt !== null) {
    throw new AppError(404, 'Player not found');
  }

  await prisma.player.update({
    where: { id: req.params.id },
    data: { deletedAt: new Date() },
  });

  res.status(200).json({ message: 'Player deleted' });
});

// ─── GET /:id/stats — Performance stats ─────────────────────────────────────────

router.get('/:id/stats', async (req: Request, res: Response) => {
  const player = await prisma.player.findUnique({
    where: { id: req.params.id },
  });

  if (!player || player.deletedAt !== null) {
    throw new AppError(404, 'Player not found');
  }

  const stats = await getPlayerStats(player.id);

  res.status(200).json(stats);
});

// ─── GET /:id/videos — Videos featuring player ──────────────────────────────────

router.get('/:id/videos', async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string, 10) || 20));
  const skip = (page - 1) * limit;

  const player = await prisma.player.findUnique({
    where: { id: req.params.id },
  });

  if (!player || player.deletedAt !== null) {
    throw new AppError(404, 'Player not found');
  }

  // Find videos through analysisJobs that have playerTrackings for this player
  const trackings = await prisma.playerTracking.findMany({
    where: { playerId: req.params.id },
    select: { analysisJobId: true },
    distinct: ['analysisJobId'],
  });

  const analysisJobIds = trackings.map((t) => t.analysisJobId);

  if (analysisJobIds.length === 0) {
    res.status(200).json({
      data: [],
      total: 0,
      page,
      totalPages: 0,
    });
    return;
  }

  const videoWhere = {
    analysisJobs: {
      some: { id: { in: analysisJobIds } },
    },
    deletedAt: null,
  };

  const [data, total] = await Promise.all([
    prisma.video.findMany({
      where: videoWhere,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.video.count({ where: videoWhere }),
  ]);

  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    data,
    total,
    page,
    totalPages,
  });
});

// ─── GET /:id/heatmap — Aggregated heatmap ──────────────────────────────────────

router.get('/:id/heatmap', async (req: Request, res: Response) => {
  const player = await prisma.player.findUnique({
    where: { id: req.params.id },
  });

  if (!player || player.deletedAt !== null) {
    throw new AppError(404, 'Player not found');
  }

  const where: Record<string, unknown> = {
    playerId: req.params.id,
    heatMapData: { not: null },
  };

  const { analysisJobId } = req.query as { analysisJobId?: string };

  if (analysisJobId) {
    where.analysisJobId = analysisJobId;
  }

  const trackings = await prisma.playerTracking.findMany({
    where,
    select: {
      id: true,
      analysisJobId: true,
      heatMapData: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  res.status(200).json(trackings);
});

export default router;
