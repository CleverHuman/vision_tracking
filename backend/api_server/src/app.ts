import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { v4 as uuid } from 'uuid';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env';
import { logger } from './config/logger';
import { errorHandler } from './config/error.middleware';

// Route imports
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/users.routes';
import teamRoutes from './routes/teams.routes';
import playerRoutes from './routes/players.routes';
import videoRoutes from './routes/videos.routes';
import matchRoutes from './routes/matches.routes';
import analysisRoutes from './routes/analysis.routes';
import highlightRoutes from './routes/highlights.routes';
import reportRoutes from './routes/reports.routes';
import annotationRoutes from './routes/annotations.routes';
import notificationRoutes from './routes/notifications.routes';
import webhookRoutes from './routes/webhook.routes';

const app = express();

// ─── Security ─────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  })
);

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});
app.use('/api/', limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many auth attempts, please try again later' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Request ID Middleware ────────────────────────────────────────────────────
app.use((req, _res, next) => {
  req.requestId = (req.headers['x-request-id'] as string) || uuid();
  next();
});

// ─── Request Logging ──────────────────────────────────────────────────────────
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl}`, {
      requestId: req.requestId,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    });
  });
  next();
});

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/highlights', highlightRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/annotations', annotationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/internal', webhookRoutes);

// ─── Swagger Docs ─────────────────────────────────────────────────────────────
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Vision Tracking API',
    version: '1.0.0',
    description: 'Sports Video Analysis Platform API',
  },
  servers: [
    { url: `http://localhost:${env.PORT}`, description: 'Development' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'username', 'password', 'fullName'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  username: { type: 'string', minLength: 3 },
                  password: { type: 'string', minLength: 8 },
                  fullName: { type: 'string' },
                  role: { type: 'string', enum: ['COACH', 'ANALYST', 'ATHLETE', 'SCOUT', 'MANAGER'] },
                  sport: { type: 'string' },
                  teamId: { type: 'string', format: 'uuid' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'User created successfully' },
          '409': { description: 'Email or username already taken' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Login successful' },
          '401': { description: 'Invalid credentials' },
        },
      },
    },
    '/api/auth/refresh': {
      post: { tags: ['Auth'], summary: 'Refresh access token', responses: { '200': { description: 'Token refreshed' } } },
    },
    '/api/auth/logout': {
      post: { tags: ['Auth'], summary: 'Logout', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Logged out' } } },
    },
    '/api/auth/me': {
      get: { tags: ['Auth'], summary: 'Get current user', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Current user profile' } } },
    },
    '/api/videos/upload': {
      post: {
        tags: ['Videos'],
        summary: 'Upload a video',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'multipart/form-data': { schema: { type: 'object', properties: { video: { type: 'string', format: 'binary' }, title: { type: 'string' }, category: { type: 'string' } } } } },
        },
        responses: { '201': { description: 'Video uploaded' } },
      },
    },
    '/api/analysis/start': {
      post: {
        tags: ['Analysis'],
        summary: 'Start a new analysis job',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['videoId', 'type'],
                properties: {
                  videoId: { type: 'string', format: 'uuid' },
                  matchId: { type: 'string', format: 'uuid' },
                  type: { type: 'string', enum: ['FULL_MATCH', 'PLAYER_TRACKING', 'TACTICAL', 'SET_PIECE', 'SCOUTING', 'PERFORMANCE'] },
                  modelConfig: { type: 'object' },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Analysis job queued' } },
      },
    },
  },
};

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

export default app;
