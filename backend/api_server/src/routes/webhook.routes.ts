import 'express-async-errors';
import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AppError } from '../config/error.middleware';
import { logger } from '../config/logger';
import { env } from '../config/env';
import { getSocketIO } from '../socket/live-analysis.gateway';
import { NextFunction } from 'express';

const router = Router();

function getLiveNamespace() {
  const io = getSocketIO();
  return io?.of('/live') ?? null;
}

// ─── Internal Webhook Secret Validation ─────────────────────────────────────

function validateWebhookSecret(req: Request, res: Response, next: NextFunction): void {
  const secret = req.headers['x-webhook-secret'] as string;
  if (!secret || secret !== env.INTERNAL_WEBHOOK_SECRET) {
    res.status(401).json({ error: 'Invalid webhook secret' });
    return;
  }
  next();
}

// ─── POST /api/internal/analysis/webhook ────────────────────────────────────

router.post('/analysis/webhook', validateWebhookSecret, async (req: Request, res: Response) => {
  const {
    job_id,
    status,
    progress,
    message,
    result_data,
    player_trackings,
    events,
    error_message,
  } = req.body;

  if (!job_id) {
    throw new AppError(400, 'job_id is required');
  }

  const job = await prisma.analysisJob.findUnique({
    where: { id: job_id },
    include: { video: { select: { sport: true } } },
  });

  if (!job) {
    throw new AppError(404, 'Analysis job not found');
  }

  logger.info(`Webhook received for job ${job_id}`, { status, progress });

  const live = getLiveNamespace();

  // ── Handle progress updates ─────────────────────────────────────────────
  if (status === 'PROCESSING' && progress !== undefined) {
    await prisma.analysisJob.update({
      where: { id: job_id },
      data: { status: 'PROCESSING', startedAt: job.startedAt || new Date() },
    });

    live?.to(`job:${job_id}`).emit('analysis_progress', {
      jobId: job_id,
      progress,
      message: message || `Processing: ${progress}%`,
    });

    res.json({ received: true });
    return;
  }

  // ── Handle tracking updates (streaming) ─────────────────────────────────
  if (status === 'TRACKING_UPDATE') {
    live?.to(`job:${job_id}`).emit('tracking_update', {
      players: req.body.players,
      ball: req.body.ball,
      timestamp: req.body.timestamp,
    });

    res.json({ received: true });
    return;
  }

  // ── Handle event detection ──────────────────────────────────────────────
  if (status === 'EVENT_DETECTED') {
    const event = req.body.event;
    if (event) {
      await prisma.event.create({
        data: {
          analysisJobId: job_id,
          matchId: job.matchId,
          type: event.type,
          timestamp: event.timestamp,
          playerId: event.player_id || null,
          metadata: event.metadata || {},
        },
      });

      live?.to(`job:${job_id}`).emit('event_detected', {
        type: event.type,
        timestamp: event.timestamp,
        players: event.players,
        metadata: event.metadata,
      });
    }

    res.json({ received: true });
    return;
  }

  // ── Handle completion ───────────────────────────────────────────────────
  if (status === 'COMPLETED') {
    await prisma.$transaction(async (tx) => {
      // Update job
      await tx.analysisJob.update({
        where: { id: job_id },
        data: {
          status: 'COMPLETED',
          resultData: result_data || {},
          completedAt: new Date(),
        },
      });

      // Save player tracking records
      if (player_trackings && Array.isArray(player_trackings)) {
        for (const tracking of player_trackings) {
          await tx.playerTracking.create({
            data: {
              analysisJobId: job_id,
              playerId: tracking.player_id || null,
              jerseyNumber: tracking.jersey_number,
              frameData: tracking.frame_data || {},
              distanceCovered: tracking.distance_covered,
              topSpeed: tracking.top_speed,
              sprintCount: tracking.sprint_count,
              heatMapData: tracking.heat_map_data || null,
            },
          });
        }
      }

      // Save event records
      if (events && Array.isArray(events)) {
        for (const event of events) {
          await tx.event.create({
            data: {
              analysisJobId: job_id,
              matchId: job.matchId,
              type: event.type,
              timestamp: event.timestamp,
              playerId: event.player_id || null,
              metadata: event.metadata || {},
            },
          });
        }
      }

      // Update match analysis status if applicable
      if (job.matchId) {
        await tx.match.update({
          where: { id: job.matchId },
          data: { analysisStatus: 'COMPLETED' },
        });
      }

      // Create notification for job owner
      await tx.notification.create({
        data: {
          userId: job.createdById,
          type: 'ANALYSIS_COMPLETE',
          message: `Analysis job "${job.type}" has completed successfully.`,
          metadata: { jobId: job_id, type: job.type },
        },
      });
    });

    // Emit socket events
    live?.to(`job:${job_id}`).emit('analysis_complete', {
      jobId: job_id,
      summary: result_data?.summary || 'Analysis completed',
    });

    logger.info(`Analysis job ${job_id} completed`);
    res.json({ received: true, status: 'COMPLETED' });
    return;
  }

  // ── Handle failure ──────────────────────────────────────────────────────
  if (status === 'FAILED') {
    await prisma.analysisJob.update({
      where: { id: job_id },
      data: {
        status: 'FAILED',
        errorMessage: error_message || 'Unknown error',
        completedAt: new Date(),
      },
    });

    // Create notification for job owner
    await prisma.notification.create({
      data: {
        userId: job.createdById,
        type: 'ANALYSIS_FAILED',
        message: `Analysis job "${job.type}" has failed: ${error_message || 'Unknown error'}`,
        metadata: { jobId: job_id, type: job.type, error: error_message },
      },
    });

    live?.to(`job:${job_id}`).emit('analysis_progress', {
      jobId: job_id,
      progress: -1,
      message: `Analysis failed: ${error_message}`,
    });

    logger.error(`Analysis job ${job_id} failed`, { error: error_message });
    res.json({ received: true, status: 'FAILED' });
    return;
  }

  res.json({ received: true, status: 'unknown' });
});

export default router;
