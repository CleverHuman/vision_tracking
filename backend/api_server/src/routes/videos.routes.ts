import 'express-async-errors';
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { getSignedUrl, deleteFile, generateThumbnailKey } from '../lib/s3';
import { authenticate } from '../config/auth.middleware';
import { validate } from '../config/validate.middleware';
import { uploadVideo } from '../config/upload.middleware';
import { AppError } from '../config/error.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// ─── Zod Schemas ────────────────────────────────────────────────────────────────

const VideoCategory = z.enum(['MATCH', 'TRAINING', 'DRILL', 'OPPONENT', 'HIGHLIGHT']);
const VideoStatus = z.enum(['PENDING', 'UPLOADING', 'PROCESSING', 'COMPLETED', 'FAILED']);

const uploadVideoSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  teamId: z.string().uuid('Invalid team ID').optional(),
  matchId: z.string().uuid('Invalid match ID').optional(),
  category: VideoCategory,
  sport: z.string().optional(),
  tags: z
    .string()
    .optional()
    .transform((val) => (val ? val.split(',').map((t) => t.trim()).filter(Boolean) : [])),
});

const updateVideoSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty').optional(),
  description: z.string().optional(),
  category: VideoCategory.optional(),
  sport: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

const thumbnailSchema = z.object({
  timestamp: z.number().optional(),
});

const batchStatusSchema = z.object({
  videoIds: z.array(z.string().uuid('Invalid video ID')).min(1, 'At least one video ID required'),
  status: VideoStatus,
});

// ─── POST /upload — Upload video ────────────────────────────────────────────────

router.post(
  '/upload',
  uploadVideo,
  validate({ body: uploadVideoSchema }),
  async (req: Request, res: Response) => {
    const file = req.file as Express.MulterS3.File | undefined;

    if (!file) {
      throw new AppError(400, 'Video file is required');
    }

    const { title, description, teamId, matchId, category, sport, tags } = req.body;

    const video = await prisma.video.create({
      data: {
        title,
        description,
        s3Key: file.key,
        s3Url: file.location,
        mimeType: file.mimetype,
        fileSize: file.size,
        status: 'UPLOADING',
        category,
        sport,
        tags: tags || [],
        uploadedById: req.user!.id,
        teamId,
        matchId,
      },
    });

    res.status(201).json(video);
  },
);

// ─── POST /batch — Batch status update ──────────────────────────────────────────

router.post(
  '/batch',
  validate({ body: batchStatusSchema }),
  async (req: Request, res: Response) => {
    const { videoIds, status } = req.body;

    const result = await prisma.video.updateMany({
      where: { id: { in: videoIds } },
      data: { status },
    });

    res.status(200).json({ updated: result.count });
  },
);

// ─── GET / — List videos ────────────────────────────────────────────────────────

router.get('/', async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string, 10) || 20));
  const skip = (page - 1) * limit;

  const { category, sport, status, teamId, dateFrom, dateTo, search, tags } = req.query as {
    category?: string;
    sport?: string;
    status?: string;
    teamId?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
    tags?: string;
  };

  const where: Record<string, unknown> = {
    deletedAt: null,
  };

  if (category) {
    where.category = category;
  }

  if (sport) {
    where.sport = sport;
  }

  if (status) {
    where.status = status;
  }

  if (teamId) {
    where.teamId = teamId;
  }

  if (dateFrom || dateTo) {
    const createdAt: Record<string, Date> = {};
    if (dateFrom) createdAt.gte = new Date(dateFrom);
    if (dateTo) createdAt.lte = new Date(dateTo);
    where.createdAt = createdAt;
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
    prisma.video.findMany({
      where,
      include: {
        uploadedBy: { select: { id: true, fullName: true } },
        team: { select: { id: true, name: true } },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.video.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    data,
    total,
    page,
    totalPages,
  });
});

// ─── GET /:id — Get single video ────────────────────────────────────────────────

router.get('/:id', async (req: Request, res: Response) => {
  const video = await prisma.video.findUnique({
    where: { id: req.params.id },
    include: {
      uploadedBy: { select: { id: true, fullName: true } },
      team: { select: { id: true, name: true } },
      match: true,
      analysisJobs: { select: { id: true, type: true, status: true } },
    },
  });

  if (!video || video.deletedAt !== null) {
    throw new AppError(404, 'Video not found');
  }

  // Generate a signed S3 URL (1 hour expiry)
  const signedUrl = await getSignedUrl(video.s3Key, 3600);

  // Increment viewCount
  await prisma.video.update({
    where: { id: req.params.id },
    data: { viewCount: { increment: 1 } },
  });

  res.status(200).json({ ...video, signedUrl });
});

// ─── PATCH /:id — Update metadata ───────────────────────────────────────────────

router.patch(
  '/:id',
  validate({ body: updateVideoSchema }),
  async (req: Request, res: Response) => {
    const existingVideo = await prisma.video.findUnique({
      where: { id: req.params.id },
    });

    if (!existingVideo || existingVideo.deletedAt !== null) {
      throw new AppError(404, 'Video not found');
    }

    const { title, description, category, sport, tags } = req.body;

    const updateData: Record<string, unknown> = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (sport !== undefined) updateData.sport = sport;
    if (tags !== undefined) updateData.tags = tags;

    const updatedVideo = await prisma.video.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.status(200).json(updatedVideo);
  },
);

// ─── DELETE /:id — Soft delete ──────────────────────────────────────────────────

router.delete('/:id', async (req: Request, res: Response) => {
  const video = await prisma.video.findUnique({
    where: { id: req.params.id },
  });

  if (!video || video.deletedAt !== null) {
    throw new AppError(404, 'Video not found');
  }

  // Soft delete the record
  await prisma.video.update({
    where: { id: req.params.id },
    data: { deletedAt: new Date() },
  });

  // Delete S3 object
  await deleteFile(video.s3Key);

  res.status(200).json({ message: 'Video deleted' });
});

// ─── POST /:id/thumbnail — Generate/update thumbnail ────────────────────────────

router.post(
  '/:id/thumbnail',
  validate({ body: thumbnailSchema }),
  async (req: Request, res: Response) => {
    const video = await prisma.video.findUnique({
      where: { id: req.params.id },
    });

    if (!video || video.deletedAt !== null) {
      throw new AppError(404, 'Video not found');
    }

    const thumbnailKey = generateThumbnailKey(video.id);
    const thumbnailUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${thumbnailKey}`;

    const updatedVideo = await prisma.video.update({
      where: { id: req.params.id },
      data: { thumbnailUrl },
    });

    res.status(200).json(updatedVideo);
  },
);

// ─── GET /:id/annotations — Get annotations for video ───────────────────────────

router.get('/:id/annotations', async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string, 10) || 20));
  const skip = (page - 1) * limit;

  // Verify video exists
  const video = await prisma.video.findUnique({
    where: { id: req.params.id },
  });

  if (!video || video.deletedAt !== null) {
    throw new AppError(404, 'Video not found');
  }

  const where = {
    videoId: req.params.id,
    deletedAt: null,
  };

  const [data, total] = await Promise.all([
    prisma.annotation.findMany({
      where,
      include: {
        createdBy: { select: { id: true, fullName: true } },
      },
      skip,
      take: limit,
      orderBy: { timestamp: 'asc' as const },
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

export default router;
