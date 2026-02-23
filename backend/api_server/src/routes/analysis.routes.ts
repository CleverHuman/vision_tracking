import 'express-async-errors';
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { getSignedUrl } from '../lib/s3';
import { visionClient, AnalysisPayload } from '../lib/vision-client';
import { env } from '../config/env';
import { authenticate } from '../config/auth.middleware';
import { validate } from '../config/validate.middleware';
import { AppError } from '../config/error.middleware';
import { logger } from '../config/logger';

const router = Router();

// All routes require authentication
router.use(authenticate);

// ─── Zod Schemas ────────────────────────────────────────────────────────────────

const AnalysisType = z.enum([
  'FULL_MATCH',
  'PLAYER_TRACKING',
  'TACTICAL',
  'SET_PIECE',
  'SCOUTING',
  'PERFORMANCE',
]);

const startAnalysisSchema = z.object({
  videoId: z.string().uuid('Invalid video ID'),
  matchId: z.string().uuid('Invalid match ID').optional(),
  type: AnalysisType,
  modelConfig: z.record(z.unknown()).optional(),
});

// ─── POST /start — Start analysis ──────────────────────────────────────────────

router.post(
  '/start',
  validate({ body: startAnalysisSchema }),
  async (req: Request, res: Response) => {
    const { videoId, matchId, type, modelConfig } = req.body;

    // Verify video exists
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      select: { id: true, s3Key: true, sport: true },
    });

    if (!video) {
      throw new AppError(404, 'Video not found');
    }

    // Create the analysis job record
    const analysisJob = await prisma.analysisJob.create({
      data: {
        videoId,
        matchId: matchId || null,
        type,
        status: 'QUEUED',
        modelConfig: modelConfig || null,
        createdById: req.user!.id,
      },
    });

    // Generate signed URL for the video
    const signedVideoUrl = await getSignedUrl(video.s3Key!, 7200);

    // Dispatch directly to Vision server
    const payload: AnalysisPayload = {
      job_id: analysisJob.id,
      video_url: signedVideoUrl,
      video_id: videoId,
      match_id: matchId || null,
      analysis_type: type,
      sport: video.sport || 'soccer',
      model_config: modelConfig || {},
      webhook_url: `http://api_server:${env.PORT}/api/internal/analysis/webhook`,
    };

    try {
      const result = await visionClient.startAnalysis(payload);
      if (result.accepted) {
        await prisma.analysisJob.update({
          where: { id: analysisJob.id },
          data: { status: 'PROCESSING', startedAt: new Date() },
        });
      }
    } catch (err) {
      logger.error('Failed to dispatch to Vision server', {
        jobId: analysisJob.id,
        error: (err as Error).message,
      });
      // Job stays QUEUED — can be retried later
    }

    logger.info('Analysis job created', {
      jobId: analysisJob.id,
      videoId,
      type,
    });

    res.status(201).json({
      job: analysisJob,
      message: 'Analysis started',
    });
  },
);

// ─── GET /video/:videoId — All analysis jobs for a video ────────────────────────

router.get('/video/:videoId', async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string, 10) || 20));
  const skip = (page - 1) * limit;

  const where = { videoId: req.params.videoId };

  const [data, total] = await Promise.all([
    prisma.analysisJob.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.analysisJob.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    data,
    total,
    page,
    totalPages,
  });
});

// ─── GET /:jobId — Get job status + results ─────────────────────────────────────

router.get('/:jobId', async (req: Request, res: Response) => {
  const job = await prisma.analysisJob.findUnique({
    where: { id: req.params.jobId },
    include: {
      video: { select: { id: true, title: true } },
      match: { select: { id: true, homeTeam: true, awayTeam: true } },
      createdBy: { select: { id: true, fullName: true } },
    },
  });

  if (!job) {
    throw new AppError(404, 'Analysis job not found');
  }

  // Strip resultData if not completed
  const result: Record<string, unknown> = { ...job };
  if (job.status !== 'COMPLETED') {
    delete result.resultData;
  }

  // Try to get live status from vision server
  let liveStatus = null;
  try {
    liveStatus = await visionClient.getJobStatus(job.id);
  } catch (err) {
    logger.warn('Failed to fetch live job status from vision server', {
      jobId: job.id,
      error: (err as Error).message,
    });
  }

  res.status(200).json({
    ...result,
    liveStatus,
  });
});

// ─── GET /:jobId/tracking — Player tracking data ────────────────────────────────

router.get('/:jobId/tracking', async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string, 10) || 20));
  const skip = (page - 1) * limit;

  const { frameStart, frameEnd, playerId } = req.query as {
    frameStart?: string;
    frameEnd?: string;
    playerId?: string;
  };

  // Verify job exists
  const job = await prisma.analysisJob.findUnique({
    where: { id: req.params.jobId },
    select: { id: true },
  });

  if (!job) {
    throw new AppError(404, 'Analysis job not found');
  }

  const where: Record<string, unknown> = {
    analysisJobId: req.params.jobId,
  };

  if (playerId) {
    where.playerId = playerId;
  }

  // Note: frameData is a JSON field so frame-range filtering cannot be done at the DB level.
  // The frameStart/frameEnd parameters are acknowledged but clients should apply frame filtering
  // on the returned data.

  const [data, total] = await Promise.all([
    prisma.playerTracking.findMany({
      where,
      include: {
        player: { select: { id: true, name: true } },
      },
      skip,
      take: limit,
    }),
    prisma.playerTracking.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    data,
    total,
    page,
    totalPages,
    _note: 'frameData is stored as JSON. Use frameStart/frameEnd query params for client-side filtering.',
    filters: {
      frameStart: frameStart ? parseInt(frameStart, 10) : null,
      frameEnd: frameEnd ? parseInt(frameEnd, 10) : null,
      playerId: playerId || null,
    },
  });
});

// ─── GET /:jobId/events — Events timeline ───────────────────────────────────────

router.get('/:jobId/events', async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string, 10) || 20));
  const skip = (page - 1) * limit;

  const { type } = req.query as { type?: string };

  // Verify job exists
  const job = await prisma.analysisJob.findUnique({
    where: { id: req.params.jobId },
    select: { id: true },
  });

  if (!job) {
    throw new AppError(404, 'Analysis job not found');
  }

  const where: Record<string, unknown> = {
    analysisJobId: req.params.jobId,
  };

  if (type) {
    where.type = type;
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

// ─── GET /:jobId/heatmap/:playerId — Individual heatmap ─────────────────────────

router.get('/:jobId/heatmap/:playerId', async (req: Request, res: Response) => {
  const trackings = await prisma.playerTracking.findMany({
    where: {
      analysisJobId: req.params.jobId,
      playerId: req.params.playerId,
    },
    select: {
      id: true,
      jerseyNumber: true,
      heatMapData: true,
      distanceCovered: true,
      topSpeed: true,
      sprintCount: true,
    },
  });

  if (trackings.length === 0) {
    throw new AppError(404, 'No tracking data found for this player in this job');
  }

  // Aggregate summary across all tracking records for this player
  const summary = {
    totalDistanceCovered: trackings.reduce(
      (sum, t) => sum + (t.distanceCovered ?? 0),
      0,
    ),
    maxTopSpeed: Math.max(...trackings.map((t) => t.topSpeed ?? 0)),
    totalSprintCount: trackings.reduce(
      (sum, t) => sum + (t.sprintCount ?? 0),
      0,
    ),
    jerseyNumber: trackings[0].jerseyNumber,
  };

  res.status(200).json({
    playerId: req.params.playerId,
    analysisJobId: req.params.jobId,
    heatMapData: trackings.map((t) => ({
      trackingId: t.id,
      data: t.heatMapData,
    })),
    summary,
  });
});

// ─── POST /:jobId/cancel — Cancel running job ──────────────────────────────────

router.post('/:jobId/cancel', async (req: Request, res: Response) => {
  const job = await prisma.analysisJob.findUnique({
    where: { id: req.params.jobId },
  });

  if (!job) {
    throw new AppError(404, 'Analysis job not found');
  }

  if (job.status !== 'QUEUED' && job.status !== 'PROCESSING') {
    throw new AppError(400, `Cannot cancel job with status ${job.status}`);
  }

  // Attempt to cancel on the vision server
  try {
    await visionClient.cancelJob(job.id);
  } catch (err) {
    logger.warn('Failed to cancel job on vision server', {
      jobId: job.id,
      error: (err as Error).message,
    });
  }

  // Update status to FAILED with cancellation message
  await prisma.analysisJob.update({
    where: { id: job.id },
    data: {
      status: 'FAILED',
      errorMessage: 'Cancelled by user',
      completedAt: new Date(),
    },
  });

  logger.info('Analysis job cancelled', { jobId: job.id });

  res.status(200).json({ message: 'Job cancelled' });
});

export default router;
