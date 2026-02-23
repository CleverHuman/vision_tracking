import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { logger } from '../config/logger';

let io: Server | null = null;

export function getSocketIO(): Server | null {
  return io;
}

export function initializeSocketIO(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: env.FRONTEND_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    path: '/socket.io',
  });

  // ─── /live Namespace ────────────────────────────────────────────────────
  const liveNamespace = io.of('/live');

  // Authentication middleware
  liveNamespace.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token as string, env.JWT_SECRET) as {
        userId: string;
        email: string;
        role: string;
      };
      (socket as Socket & { userId?: string }).userId = decoded.userId;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  liveNamespace.on('connection', (socket) => {
    const userId = (socket as Socket & { userId?: string }).userId;
    logger.info(`Socket connected: ${socket.id}`, { userId });

    // ── Join analysis session ───────────────────────────────────────────
    socket.on('join_session', (jobId: string) => {
      if (!jobId || typeof jobId !== 'string') {
        socket.emit('error', { message: 'Invalid jobId' });
        return;
      }
      const room = `job:${jobId}`;
      socket.join(room);
      logger.debug(`Socket ${socket.id} joined room ${room}`);
      socket.emit('session_joined', { jobId, room });
    });

    // ── Leave analysis session ──────────────────────────────────────────
    socket.on('leave_session', (jobId: string) => {
      const room = `job:${jobId}`;
      socket.leave(room);
      logger.debug(`Socket ${socket.id} left room ${room}`);
    });

    // ── Disconnect ──────────────────────────────────────────────────────
    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected: ${socket.id}`, { reason, userId });
    });
  });

  logger.info('Socket.IO initialized with /live namespace');
  return io;
}

// Utility functions for emitting events from other parts of the app

export function emitAnalysisProgress(
  jobId: string,
  progress: number,
  message: string
): void {
  io?.of('/live').to(`job:${jobId}`).emit('analysis_progress', {
    jobId,
    progress,
    message,
  });
}

export function emitTrackingUpdate(
  jobId: string,
  data: { players: unknown; ball: unknown; timestamp: number }
): void {
  io?.of('/live').to(`job:${jobId}`).emit('tracking_update', data);
}

export function emitEventDetected(
  jobId: string,
  data: { type: string; timestamp: number; players: unknown; metadata: unknown }
): void {
  io?.of('/live').to(`job:${jobId}`).emit('event_detected', data);
}

export function emitAnalysisComplete(
  jobId: string,
  summary: unknown
): void {
  io?.of('/live').to(`job:${jobId}`).emit('analysis_complete', {
    jobId,
    summary,
  });
}
