import 'express-async-errors';
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate } from '../config/auth.middleware';
import { requireRole } from '../config/rbac.middleware';
import { validate } from '../config/validate.middleware';
import { AppError } from '../config/error.middleware';
import { logger } from '../config/logger';

const router = Router();

// All routes require authentication
router.use(authenticate);

// ─── Zod Schemas ────────────────────────────────────────────────────────────────

const createTeamSchema = z.object({
  name: z.string().min(1, 'Team name is required'),
  sport: z.string().min(1, 'Sport is required'),
  organizationId: z.string().uuid('Invalid organization ID'),
  logoUrl: z.string().url('Invalid logo URL').optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
});

const updateTeamSchema = z.object({
  name: z.string().min(1, 'Team name cannot be empty').optional(),
  sport: z.string().min(1, 'Sport cannot be empty').optional(),
  logoUrl: z.string().url('Invalid logo URL').optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
});

const inviteSchema = z.object({
  userId: z.string().uuid('Invalid user ID').optional(),
  email: z.string().email('Invalid email address').optional(),
}).refine((data) => data.userId || data.email, {
  message: 'Either userId or email must be provided',
});

// ─── POST / — Create team ───────────────────────────────────────────────────────

router.post(
  '/',
  requireRole('COACH', 'MANAGER'),
  validate({ body: createTeamSchema }),
  async (req: Request, res: Response) => {
    const { name, sport, organizationId, logoUrl, primaryColor, secondaryColor } = req.body;

    // Verify organization exists
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new AppError(404, 'Organization not found');
    }

    const team = await prisma.team.create({
      data: {
        name,
        sport,
        organizationId,
        logoUrl,
        primaryColor,
        secondaryColor,
      },
    });

    res.status(201).json(team);
  },
);

// ─── GET / — List teams ─────────────────────────────────────────────────────────

router.get('/', async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string, 10) || 20));
  const skip = (page - 1) * limit;

  const { sport, organizationId, search } = req.query as {
    sport?: string;
    organizationId?: string;
    search?: string;
  };

  const where: Record<string, unknown> = {};

  if (sport) {
    where.sport = sport;
  }

  if (organizationId) {
    where.organizationId = organizationId;
  }

  if (search) {
    where.name = { contains: search, mode: 'insensitive' };
  }

  const [data, total] = await Promise.all([
    prisma.team.findMany({
      where,
      include: {
        _count: {
          select: {
            players: true,
            users: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.team.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    data,
    total,
    page,
    totalPages,
  });
});

// ─── GET /:id — Get team ────────────────────────────────────────────────────────

router.get('/:id', async (req: Request, res: Response) => {
  const team = await prisma.team.findUnique({
    where: { id: req.params.id },
    include: {
      players: {
        where: { deletedAt: null, isActive: true },
      },
      users: {
        select: { id: true, fullName: true, role: true },
      },
      organization: true,
    },
  });

  if (!team) {
    throw new AppError(404, 'Team not found');
  }

  res.status(200).json(team);
});

// ─── PATCH /:id — Update team ───────────────────────────────────────────────────

router.patch(
  '/:id',
  requireRole('COACH', 'MANAGER'),
  validate({ body: updateTeamSchema }),
  async (req: Request, res: Response) => {
    const existingTeam = await prisma.team.findUnique({
      where: { id: req.params.id },
    });

    if (!existingTeam) {
      throw new AppError(404, 'Team not found');
    }

    const updateData: Record<string, unknown> = {};
    const { name, sport, logoUrl, primaryColor, secondaryColor } = req.body;

    if (name !== undefined) updateData.name = name;
    if (sport !== undefined) updateData.sport = sport;
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl;
    if (primaryColor !== undefined) updateData.primaryColor = primaryColor;
    if (secondaryColor !== undefined) updateData.secondaryColor = secondaryColor;

    const updatedTeam = await prisma.team.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.status(200).json(updatedTeam);
  },
);

// ─── DELETE /:id — Delete team ──────────────────────────────────────────────────

router.delete(
  '/:id',
  requireRole('MANAGER'),
  async (req: Request, res: Response) => {
    const existingTeam = await prisma.team.findUnique({
      where: { id: req.params.id },
    });

    if (!existingTeam) {
      throw new AppError(404, 'Team not found');
    }

    await prisma.team.delete({
      where: { id: req.params.id },
    });

    res.status(200).json({ message: 'Team deleted' });
  },
);

// ─── GET /:id/players — Team roster ─────────────────────────────────────────────

router.get('/:id/players', async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string, 10) || 20));
  const skip = (page - 1) * limit;

  const { position, isActive } = req.query as {
    position?: string;
    isActive?: string;
  };

  // Verify team exists
  const team = await prisma.team.findUnique({
    where: { id: req.params.id },
  });

  if (!team) {
    throw new AppError(404, 'Team not found');
  }

  const where: Record<string, unknown> = {
    teamId: req.params.id,
    deletedAt: null,
  };

  if (position) {
    where.position = position;
  }

  if (isActive !== undefined) {
    where.isActive = isActive === 'true';
  }

  const [data, total] = await Promise.all([
    prisma.player.findMany({
      where,
      skip,
      take: limit,
      orderBy: { jerseyNumber: 'asc' },
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

// ─── GET /:id/stats — Team stats ────────────────────────────────────────────────

router.get('/:id/stats', async (req: Request, res: Response) => {
  const teamId = req.params.id;

  // Verify team exists
  const team = await prisma.team.findUnique({
    where: { id: teamId },
  });

  if (!team) {
    throw new AppError(404, 'Team not found');
  }

  // Aggregate match stats
  const matches = await prisma.match.findMany({
    where: { teamId, deletedAt: null },
    select: {
      result: true,
      homeScore: true,
      awayScore: true,
      homeTeam: true,
      awayTeam: true,
    },
  });

  const totalMatches = matches.length;
  const wins = matches.filter((m) => m.result === 'WIN').length;
  const losses = matches.filter((m) => m.result === 'LOSS').length;
  const draws = matches.filter((m) => m.result === 'DRAW').length;

  let goalsScored = 0;
  let goalsConceded = 0;

  for (const match of matches) {
    const isHome = match.homeTeam === team.name;
    const home = match.homeScore ?? 0;
    const away = match.awayScore ?? 0;

    if (isHome) {
      goalsScored += home;
      goalsConceded += away;
    } else {
      goalsScored += away;
      goalsConceded += home;
    }
  }

  // Count active players and videos
  const [totalPlayers, totalVideos] = await Promise.all([
    prisma.player.count({
      where: { teamId, deletedAt: null, isActive: true },
    }),
    prisma.video.count({
      where: { teamId, deletedAt: null },
    }),
  ]);

  res.status(200).json({
    totalMatches,
    wins,
    losses,
    draws,
    goalsScored,
    goalsConceded,
    totalPlayers,
    totalVideos,
  });
});

// ─── POST /:id/invite — Invite user to team ─────────────────────────────────────

router.post(
  '/:id/invite',
  requireRole('COACH', 'MANAGER'),
  validate({ body: inviteSchema }),
  async (req: Request, res: Response) => {
    const teamId = req.params.id;

    // Verify team exists
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      throw new AppError(404, 'Team not found');
    }

    const { userId, email } = req.body;

    if (userId) {
      // Direct assignment: update user's teamId
      const user = await prisma.user.findFirst({
        where: { id: userId, deletedAt: null },
      });

      if (!user) {
        throw new AppError(404, 'User not found');
      }

      await prisma.user.update({
        where: { id: userId },
        data: { teamId },
      });
    } else if (email) {
      // Mock invitation — log the invite
      logger.info('Team invitation sent', {
        teamId,
        teamName: team.name,
        invitedEmail: email,
        invitedBy: req.user!.id,
      });
    }

    res.status(200).json({ message: 'User invited' });
  },
);

export default router;
