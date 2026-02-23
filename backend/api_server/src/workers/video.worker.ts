import prisma from '../lib/prisma';
import { getSignedUrl } from '../lib/s3';
import { visionClient, AnalysisPayload } from '../lib/vision-client';
import { logger } from '../config/logger';
import { env } from '../config/env';

export interface VideoAnalysisJobData {
  jobId: string;
  videoId: string;
  matchId: string | null;
  type: string;
  sport: string;
  modelConfig: Record<string, unknown>;
}

/**
 * Process a video analysis job by dispatching it to the Vision server.
 * Called directly from the analysis route instead of through a queue.
 */
export async function processVideoAnalysis(data: VideoAnalysisJobData): Promise<void> {
  const { jobId, videoId, matchId, type, sport, modelConfig } = data;

  logger.info(`Processing video analysis job: ${jobId}`, {
    videoId,
    type,
    sport,
  });

  try {
    // 1. Update AnalysisJob status to PROCESSING
    await prisma.analysisJob.update({
      where: { id: jobId },
      data: { status: 'PROCESSING', startedAt: new Date() },
    });

    // 2. Fetch Video s3Key and generate signed URL
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      select: { s3Key: true, sport: true },
    });

    if (!video) {
      throw new Error(`Video not found: ${videoId}`);
    }

    const signedVideoUrl = await getSignedUrl(video.s3Key, 7200); // 2 hour expiry

    // 3. POST to Python Vision_server
    const payload: AnalysisPayload = {
      job_id: jobId,
      video_url: signedVideoUrl,
      video_id: videoId,
      match_id: matchId,
      analysis_type: type,
      sport: sport || video.sport || 'soccer',
      model_config: modelConfig || {},
      webhook_url: `http://api_server:${env.PORT}/api/internal/analysis/webhook`,
    };

    const result = await visionClient.startAnalysis(payload);

    if (result.accepted) {
      logger.info(`Vision server accepted job: ${jobId}`);
      await prisma.video.update({
        where: { id: videoId },
        data: { status: 'PROCESSING' },
      });
    } else {
      throw new Error('Vision server did not accept the job');
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Video analysis job failed: ${jobId}`, {
      error: errorMessage,
    });

    // Update job status to FAILED
    await prisma.analysisJob.update({
      where: { id: jobId },
      data: {
        status: 'FAILED',
        errorMessage,
        completedAt: new Date(),
      },
    });

    // Create notification for job owner
    const analysisJob = await prisma.analysisJob.findUnique({
      where: { id: jobId },
      select: { createdById: true, type: true },
    });

    if (analysisJob) {
      await prisma.notification.create({
        data: {
          userId: analysisJob.createdById,
          type: 'ANALYSIS_FAILED',
          message: `Analysis job "${analysisJob.type}" failed: ${errorMessage}`,
          metadata: { jobId, error: errorMessage },
        },
      });
    }
  }
}
