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

const AnnotationTypeEnum = z.enum(['DRAWING', 'TEXT', 'ARROW', 'ZONE']);

const createAnnotationSchema = z.object({
  videoId: z.string().uuid('Invalid video ID'),
  timestamp: z.number().min(0, 'Timestamp must be non-negative'),
  type: AnnotationTypeEnum,
  data: z.record(z.unknown()),
});

const updateAnnotationSchema = z.object({
  timestamp: z.number().min(0, 'Timestamp must be non-negative').optional(),
  type: AnnotationTypeEnum.optional(),
  data: z.record(z.unknown()).optional(),
});

// ─── POST / — Save annotation ────────────────────────────────────────────────────

router.post(
  '/',
  validate({ body: createAnnotationSchema }),
  async (req: Request, res: Response) => {
    const { videoId, timestamp, type, data } = req.body;

    // Verify video exists
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      select: { id: true },
    });

    if (!video) {
      throw new AppError(404, 'Video not found');
    }

    const annotation = await prisma.annotation.create({
      data: {
        videoId,
        timestamp,
        type,
        data,
        createdById: req.user!.id,
      },
    });

    res.status(201).json(annotation);
  },
);

// ─── GET /video/:videoId — All annotations for video ─────────────────────────────

router.get('/video/:videoId', async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string, 10) || 20));
  const skip = (page - 1) * limit;

  const { type } = req.query as { type?: string };

  const where: Record<string, unknown> = {
    videoId: req.params.videoId,
    deletedAt: null,
  };

  if (type) {
    const parsed = AnnotationTypeEnum.safeParse(type);
    if (parsed.success) {
      where.type = parsed.data;
    }
  }

  const [data, total] = await Promise.all([
    prisma.annotation.findMany({
      where,
      include: {
        createdBy: { select: { id: true, fullName: true } },
      },
      skip,
      take: limit,
      orderBy: { timestamp: 'asc' },
    }),
    prisma.annotation.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    data,
    total,
    page,
    totalPages,
  });
});

// ─── PATCH /:id — Update annotation ─────────────────────────────────────────────

router.patch(
  '/:id',
  validate({ body: updateAnnotationSchema }),
  async (req: Request, res: Response) => {
    const annotation = await prisma.annotation.findUnique({
      where: { id: req.params.id },
    });

    if (!annotation || annotation.deletedAt !== null) {
      throw new AppError(404, 'Annotation not found');
    }

    // Verify ownership
    if (annotation.createdById !== req.user!.id) {
      throw new AppError(403, 'Not authorized to update this annotation');
    }

    const { timestamp, type, data } = req.body;

    const updated = await prisma.annotation.update({
      where: { id: req.params.id },
      data: {
        ...(timestamp !== undefined && { timestamp }),
        ...(type !== undefined && { type }),
        ...(data !== undefined && { data }),
      },
    });

    res.status(200).json(updated);
  },
);

// ─── DELETE /:id — Soft delete ──────────────────────────────────────────────────

router.delete('/:id', async (req: Request, res: Response) => {
  const annotation = await prisma.annotation.findUnique({
    where: { id: req.params.id },
  });

  if (!annotation || annotation.deletedAt !== null) {
    throw new AppError(404, 'Annotation not found');
  }

  // Verify ownership or MANAGER/COACH role
  const isOwner = annotation.createdById === req.user!.id;
  const hasRole = ['MANAGER', 'COACH'].includes(req.user!.role);

  if (!isOwner && !hasRole) {
    throw new AppError(403, 'Not authorized to delete this annotation');
  }

  await prisma.annotation.update({
    where: { id: req.params.id },
    data: { deletedAt: new Date() },
  });

  res.status(200).json({ message: 'Annotation deleted' });
});

export default router;
