import 'express-async-errors';
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate } from '../config/auth.middleware';
import { validate } from '../config/validate.middleware';
import { AppError } from '../config/error.middleware';
import { logger } from '../config/logger';

const router = Router();

// All routes require authentication
router.use(authenticate);

// ─── Zod Schemas ────────────────────────────────────────────────────────────────

const ReportType = z.enum([
  'PRE_MATCH',
  'POST_MATCH',
  'PLAYER',
  'TEAM',
  'CUSTOM',
]);

const generateReportSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  type: ReportType,
  matchId: z.string().uuid('Invalid match ID').optional(),
  teamId: z.string().uuid('Invalid team ID').optional(),
  playerId: z.string().uuid('Invalid player ID').optional(),
  content: z.record(z.unknown()).optional(),
  templateId: z.string().optional(),
});

const shareReportSchema = z.object({
  userIds: z.array(z.string().uuid('Invalid user ID')).min(1, 'At least one user ID is required'),
});

const scheduleReportSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  type: ReportType,
  teamId: z.string().uuid('Invalid team ID').optional(),
  matchId: z.string().uuid('Invalid match ID').optional(),
  playerId: z.string().uuid('Invalid player ID').optional(),
  scheduledAt: z.string().datetime({ message: 'scheduledAt must be a valid ISO date string' }),
  content: z.record(z.unknown()).optional(),
});

// ─── POST /generate — Create report ─────────────────────────────────────────────

router.post(
  '/generate',
  validate({ body: generateReportSchema }),
  async (req: Request, res: Response) => {
    const { title, type, matchId, teamId, playerId, content, templateId } = req.body;

    const report = await prisma.report.create({
      data: {
        title,
        type,
        matchId: matchId || null,
        teamId: teamId || null,
        playerId: playerId || null,
        content: content || null,
        createdById: req.user!.id,
      },
    });

    logger.info('Report generated', {
      reportId: report.id,
      type,
      templateId: templateId || null,
      createdBy: req.user!.id,
    });

    res.status(201).json(report);
  },
);

// ─── POST /schedule — Schedule automated report ─────────────────────────────────

router.post(
  '/schedule',
  validate({ body: scheduleReportSchema }),
  async (req: Request, res: Response) => {
    const { title, type, teamId, matchId, playerId, scheduledAt, content } = req.body;

    const report = await prisma.report.create({
      data: {
        title,
        type,
        teamId: teamId || null,
        matchId: matchId || null,
        playerId: playerId || null,
        content: content || null,
        scheduledAt: new Date(scheduledAt),
        createdById: req.user!.id,
      },
    });

    logger.info('Report scheduled', {
      reportId: report.id,
      type,
      scheduledAt,
      createdBy: req.user!.id,
    });

    res.status(201).json({
      report,
      message: 'Report scheduled',
    });
  },
);

// ─── GET / — List reports ───────────────────────────────────────────────────────

router.get('/', async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string, 10) || 20));
  const skip = (page - 1) * limit;

  const { type, matchId, teamId, playerId, search } = req.query as {
    type?: string;
    matchId?: string;
    teamId?: string;
    playerId?: string;
    search?: string;
  };

  const userId = req.user!.id;

  const where: Record<string, unknown> = {
    deletedAt: null,
    OR: [
      { createdById: userId },
      { sharedWith: { has: userId } },
    ],
  };

  if (type) {
    where.type = type;
  }

  if (matchId) {
    where.matchId = matchId;
  }

  if (teamId) {
    where.teamId = teamId;
  }

  if (playerId) {
    where.playerId = playerId;
  }

  if (search) {
    where.title = { contains: search, mode: 'insensitive' };
  }

  const [data, total] = await Promise.all([
    prisma.report.findMany({
      where,
      include: {
        match: { select: { id: true, homeTeam: true, awayTeam: true } },
        team: { select: { id: true, name: true } },
        player: { select: { id: true, name: true } },
        createdBy: { select: { id: true, fullName: true } },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.report.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    data,
    total,
    page,
    totalPages,
  });
});

// ─── GET /:id — Get report ──────────────────────────────────────────────────────

router.get('/:id', async (req: Request, res: Response) => {
  const report = await prisma.report.findUnique({
    where: { id: req.params.id },
    include: {
      match: { select: { id: true, homeTeam: true, awayTeam: true } },
      team: { select: { id: true, name: true } },
      player: { select: { id: true, name: true } },
      createdBy: { select: { id: true, fullName: true } },
    },
  });

  if (!report || report.deletedAt !== null) {
    throw new AppError(404, 'Report not found');
  }

  // Verify user has access: creator, in sharedWith, or MANAGER/COACH role
  const isCreator = report.createdById === req.user!.id;
  const isShared = report.sharedWith.includes(req.user!.id);
  const hasRole = ['MANAGER', 'COACH'].includes(req.user!.role);

  if (!isCreator && !isShared && !hasRole) {
    throw new AppError(403, 'Not authorized to view this report');
  }

  res.status(200).json(report);
});

// ─── POST /:id/share — Share with team members ─────────────────────────────────

router.post(
  '/:id/share',
  validate({ body: shareReportSchema }),
  async (req: Request, res: Response) => {
    const report = await prisma.report.findUnique({
      where: { id: req.params.id },
    });

    if (!report || report.deletedAt !== null) {
      throw new AppError(404, 'Report not found');
    }

    const { userIds } = req.body;

    // Deduplicate: merge existing sharedWith with new userIds
    const updatedSharedWith = Array.from(new Set([...report.sharedWith, ...userIds]));

    await prisma.report.update({
      where: { id: req.params.id },
      data: { sharedWith: updatedSharedWith },
    });

    // Determine newly added users (not already in sharedWith)
    const existingSet = new Set(report.sharedWith);
    const newUserIds = (userIds as string[]).filter((id: string) => !existingSet.has(id));

    // Create notifications for each newly shared user
    if (newUserIds.length > 0) {
      await prisma.notification.createMany({
        data: newUserIds.map((userId: string) => ({
          userId,
          type: 'REPORT_SHARED',
          message: `A report "${report.title}" has been shared with you`,
          metadata: {
            reportId: report.id,
            sharedBy: req.user!.id,
          },
        })),
      });
    }

    logger.info('Report shared', {
      reportId: report.id,
      sharedWith: newUserIds,
      sharedBy: req.user!.id,
    });

    res.status(200).json({
      message: 'Report shared',
      sharedWith: updatedSharedWith,
    });
  },
);

// ─── DELETE /:id — Soft delete ──────────────────────────────────────────────────

router.delete('/:id', async (req: Request, res: Response) => {
  const report = await prisma.report.findUnique({
    where: { id: req.params.id },
  });

  if (!report || report.deletedAt !== null) {
    throw new AppError(404, 'Report not found');
  }

  // Verify ownership or MANAGER role
  const isOwner = report.createdById === req.user!.id;
  const isManager = req.user!.role === 'MANAGER';

  if (!isOwner && !isManager) {
    throw new AppError(403, 'Not authorized to delete this report');
  }

  await prisma.report.update({
    where: { id: req.params.id },
    data: { deletedAt: new Date() },
  });

  logger.info('Report soft-deleted', { reportId: req.params.id, deletedBy: req.user!.id });

  res.status(200).json({ message: 'Report deleted' });
});

export default router;
