import 'express-async-errors';
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import prisma from '../lib/prisma';
import { getSignedUrl } from '../lib/s3';
import { authenticate } from '../config/auth.middleware';
import { validate } from '../config/validate.middleware';
import { AppError } from '../config/error.middleware';
import { logger } from '../config/logger';

const router = Router();

// All routes require authentication
router.use(authenticate);

// ─── Zod Schemas ────────────────────────────────────────────────────────────────

const createHighlightSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  videoId: z.string().uuid('Invalid video ID'),
  startTime: z.number().min(0, 'Start time must be non-negative'),
  endTime: z.number(),
  eventType: z.string().optional(),
  playerId: z.string().uuid('Invalid player ID').optional(),
  matchId: z.string().uuid('Invalid match ID').optional(),
  isPublic: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
}).refine((data) => data.endTime > data.startTime, {
  message: 'End time must be greater than start time',
  path: ['endTime'],
});

const createReelSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  highlightIds: z.array(z.string().uuid('Invalid highlight ID')).min(2, 'At least 2 highlights are required'),
  description: z.string().optional(),
});

// ─── POST / — Create highlight clip ─────────────────────────────────────────────

router.post(
  '/',
  validate({ body: createHighlightSchema }),
  async (req: Request, res: Response) => {
    const { title, videoId, startTime, endTime, eventType, playerId, matchId, isPublic, tags } = req.body;

    // Verify video exists
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      select: { id: true },
    });

    if (!video) {
      throw new AppError(404, 'Video not found');
    }

    const highlight = await prisma.highlight.create({
      data: {
        title,
        videoId,
        startTime,
        endTime,
        eventType: eventType || null,
        playerId: playerId || null,
        matchId: matchId || null,
        isPublic: isPublic ?? false,
        tags: tags || [],
        createdById: req.user!.id,
      },
    });

    logger.info('Highlight created', { highlightId: highlight.id, videoId });

    res.status(201).json(highlight);
  },
);

// ─── POST /reel — Combine clips into reel (async) ──────────────────────────────
// NOTE: Must be placed BEFORE /:id to avoid route conflicts

router.post(
  '/reel',
  validate({ body: createReelSchema }),
  async (req: Request, res: Response) => {
    const { title, highlightIds, description } = req.body;

    // Verify all highlights exist
    const highlights = await prisma.highlight.findMany({
      where: {
        id: { in: highlightIds },
        deletedAt: null,
      },
      select: { id: true },
    });

    if (highlights.length !== highlightIds.length) {
      const foundIds = new Set(highlights.map((h) => h.id));
      const missingIds = highlightIds.filter((id: string) => !foundIds.has(id));
      throw new AppError(404, `Highlights not found: ${missingIds.join(', ')}`);
    }

    const jobId = uuid();

    // TODO: Integrate with a video processing service for actual reel generation
    logger.info('Highlight reel generation requested', {
      jobId,
      title,
      highlightCount: highlightIds.length,
      requestedBy: req.user!.id,
    });

    res.status(202).json({
      message: 'Reel generation queued',
      jobId,
    });
  },
);

// ─── GET / — List highlights ────────────────────────────────────────────────────

router.get('/', async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string, 10) || 20));
  const skip = (page - 1) * limit;

  const { videoId, matchId, playerId, eventType, isPublic, search, tags } = req.query as {
    videoId?: string;
    matchId?: string;
    playerId?: string;
    eventType?: string;
    isPublic?: string;
    search?: string;
    tags?: string;
  };

  const where: Record<string, unknown> = {
    deletedAt: null,
  };

  if (videoId) {
    where.videoId = videoId;
  }

  if (matchId) {
    where.matchId = matchId;
  }

  if (playerId) {
    where.playerId = playerId;
  }

  if (eventType) {
    where.eventType = eventType;
  }

  if (isPublic !== undefined) {
    where.isPublic = isPublic === 'true';
  }

  if (search) {
    where.title = { contains: search, mode: 'insensitive' };
  }

  if (tags) {
    const tagArray = tags.split(',').map((t) => t.trim()).filter(Boolean);
    if (tagArray.length > 0) {
      where.tags = { hasSome: tagArray };
    }
  }

  const [data, total] = await Promise.all([
    prisma.highlight.findMany({
      where,
      include: {
        video: { select: { id: true, title: true } },
        player: { select: { id: true, name: true } },
        match: { select: { id: true, homeTeam: true, awayTeam: true } },
        createdBy: { select: { id: true, fullName: true } },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.highlight.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    data,
    total,
    page,
    totalPages,
  });
});

// ─── GET /:id — Get single highlight ────────────────────────────────────────────

router.get('/:id', async (req: Request, res: Response) => {
  const highlight = await prisma.highlight.findUnique({
    where: { id: req.params.id },
    include: {
      video: { select: { id: true, title: true } },
      player: { select: { id: true, name: true } },
      match: { select: { id: true, homeTeam: true, awayTeam: true } },
      createdBy: { select: { id: true, fullName: true } },
    },
  });

  if (!highlight || highlight.deletedAt !== null) {
    throw new AppError(404, 'Highlight not found');
  }

  // Generate signed S3 URL if s3Key exists
  let signedUrl: string | null = null;
  if (highlight.s3Key) {
    signedUrl = await getSignedUrl(highlight.s3Key, 3600);
  }

  // Increment viewCount
  await prisma.highlight.update({
    where: { id: req.params.id },
    data: { viewCount: { increment: 1 } },
  });

  res.status(200).json({ ...highlight, signedUrl });
});

// ─── DELETE /:id — Soft delete ──────────────────────────────────────────────────

router.delete('/:id', async (req: Request, res: Response) => {
  const highlight = await prisma.highlight.findUnique({
    where: { id: req.params.id },
  });

  if (!highlight || highlight.deletedAt !== null) {
    throw new AppError(404, 'Highlight not found');
  }

  // Verify ownership or MANAGER/COACH role
  const isOwner = highlight.createdById === req.user!.id;
  const hasRole = ['MANAGER', 'COACH'].includes(req.user!.role);

  if (!isOwner && !hasRole) {
    throw new AppError(403, 'Not authorized to delete this highlight');
  }

  await prisma.highlight.update({
    where: { id: req.params.id },
    data: { deletedAt: new Date() },
  });

  logger.info('Highlight soft-deleted', { highlightId: req.params.id, deletedBy: req.user!.id });

  res.status(200).json({ message: 'Highlight deleted' });
});

// ─── POST /:id/share — Generate shareable link ─────────────────────────────────

router.post('/:id/share', async (req: Request, res: Response) => {
  const highlight = await prisma.highlight.findUnique({
    where: { id: req.params.id },
  });

  if (!highlight || highlight.deletedAt !== null) {
    throw new AppError(404, 'Highlight not found');
  }

  // Update isPublic to true
  await prisma.highlight.update({
    where: { id: req.params.id },
    data: { isPublic: true },
  });

  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
  const shareUrl = `${FRONTEND_URL}/highlights/shared/${highlight.id}`;

  logger.info('Highlight shared', { highlightId: highlight.id, sharedBy: req.user!.id });

  res.status(200).json({ shareUrl });
});

export default router;
