import 'express-async-errors';
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { env } from '../config/env';
import { authenticate } from '../config/auth.middleware';
import { validate } from '../config/validate.middleware';
import { AppError } from '../config/error.middleware';
import { logger } from '../config/logger';

const router = Router();

// ─── Zod Schemas ────────────────────────────────────────────────────────────────

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(30),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(1, 'Full name is required'),
  role: z.enum(['COACH', 'ANALYST', 'ATHLETE', 'SCOUT', 'MANAGER']).optional().default('ANALYST'),
  sport: z.string().optional(),
  teamId: z.string().uuid().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

const refreshSchema = z.object({
  refreshToken: z.string().optional(),
});

// ─── Helpers ────────────────────────────────────────────────────────────────────

function generateAccessToken(payload: { userId: string; email: string; role: string }): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '15m' });
}

function generateRefreshToken(payload: { userId: string; email: string; role: string }): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

function excludeFields<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};

// ─── POST /register ─────────────────────────────────────────────────────────────

router.post(
  '/register',
  validate({ body: registerSchema }),
  async (req: Request, res: Response) => {
    const { email, username, password, fullName, role, sport, teamId } = req.body;

    // Check email uniqueness
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      throw new AppError(409, 'Email already in use');
    }

    // Check username uniqueness
    const existingUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUsername) {
      throw new AppError(409, 'Username already taken');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate tokens
    const tokenPayload = { userId: '', email, role };

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
        fullName,
        role,
        sport,
        teamId,
      },
    });

    tokenPayload.userId = user.id;

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Store hashed refresh token
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefreshToken },
    });

    const safeUser = excludeFields(user as Record<string, unknown>, ['passwordHash', 'refreshToken']);

    logger.info('User registered', { userId: user.id, email: user.email });

    res.status(201).json({
      user: safeUser,
      accessToken,
      refreshToken,
    });
  },
);

// ─── POST /login ────────────────────────────────────────────────────────────────

router.post(
  '/login',
  validate({ body: loginSchema }),
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Find user by email (not soft-deleted)
    const user = await prisma.user.findFirst({
      where: { email, deletedAt: null },
    });

    if (!user) {
      throw new AppError(401, 'Invalid email or password');
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError(401, 'Invalid email or password');
    }

    // Generate tokens
    const tokenPayload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Store hashed refresh token
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefreshToken },
    });

    const safeUser = excludeFields(user as Record<string, unknown>, ['passwordHash', 'refreshToken']);

    logger.info('User logged in', { userId: user.id, email: user.email });

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

    res.status(200).json({
      user: safeUser,
      accessToken,
      refreshToken,
    });
  },
);

// ─── POST /refresh ──────────────────────────────────────────────────────────────

router.post(
  '/refresh',
  validate({ body: refreshSchema }),
  async (req: Request, res: Response) => {
    // Get refresh token from body or cookie
    const refreshToken: string | undefined =
      req.body.refreshToken || req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new AppError(400, 'Refresh token is required');
    }

    // Verify refresh token
    let decoded: { userId: string; email: string; role: string };
    try {
      decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as {
        userId: string;
        email: string;
        role: string;
      };
    } catch {
      throw new AppError(401, 'Invalid or expired refresh token');
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId, deletedAt: null },
    });

    if (!user || !user.refreshToken) {
      throw new AppError(401, 'Invalid refresh token');
    }

    // Verify stored refresh token matches
    const isTokenValid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isTokenValid) {
      // Potential token reuse detected - clear all refresh tokens for security
      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: null },
      });
      logger.warn('Refresh token reuse detected', { userId: user.id });
      throw new AppError(401, 'Invalid refresh token');
    }

    // Rotate: generate new tokens
    const tokenPayload = { userId: user.id, email: user.email, role: user.role };
    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    // Update stored refresh token
    const hashedRefreshToken = await bcrypt.hash(newRefreshToken, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefreshToken },
    });

    // Update cookie
    res.cookie('refreshToken', newRefreshToken, REFRESH_COOKIE_OPTIONS);

    res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  },
);

// ─── POST /logout ───────────────────────────────────────────────────────────────

router.post('/logout', authenticate, async (req: Request, res: Response) => {
  // Clear user's refresh token in DB
  await prisma.user.update({
    where: { id: req.user!.id },
    data: { refreshToken: null },
  });

  // Clear cookie
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
  });

  logger.info('User logged out', { userId: req.user!.id });

  res.status(200).json({ message: 'Logged out' });
});

// ─── POST /forgot-password ──────────────────────────────────────────────────────

router.post(
  '/forgot-password',
  validate({ body: forgotPasswordSchema }),
  async (req: Request, res: Response) => {
    const { email } = req.body;

    // Find user - don't reveal if email exists
    const user = await prisma.user.findFirst({
      where: { email, deletedAt: null },
    });

    if (user) {
      // Generate reset token (1 hour)
      const resetToken = jwt.sign(
        { userId: user.id, email: user.email, purpose: 'password-reset' },
        env.JWT_SECRET,
        { expiresIn: '1h' },
      );

      const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`;

      // Mock email - log the reset URL
      logger.info('Password reset requested', {
        userId: user.id,
        email: user.email,
        resetUrl,
      });
    }

    // Always return the same response regardless of whether user exists
    res.status(200).json({ message: 'If email exists, reset link sent' });
  },
);

// ─── POST /reset-password ───────────────────────────────────────────────────────

router.post(
  '/reset-password',
  validate({ body: resetPasswordSchema }),
  async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;

    // Verify reset token
    let decoded: { userId: string; email: string; purpose: string };
    try {
      decoded = jwt.verify(token, env.JWT_SECRET) as {
        userId: string;
        email: string;
        purpose: string;
      };
    } catch {
      throw new AppError(400, 'Invalid or expired reset token');
    }

    if (decoded.purpose !== 'password-reset') {
      throw new AppError(400, 'Invalid reset token');
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId, deletedAt: null },
    });

    if (!user) {
      throw new AppError(400, 'Invalid reset token');
    }

    // Hash new password and update user
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        refreshToken: null, // Invalidate existing sessions
      },
    });

    logger.info('Password reset successful', { userId: user.id });

    res.status(200).json({ message: 'Password reset successful' });
  },
);

// ─── GET /me ────────────────────────────────────────────────────────────────────

router.get('/me', authenticate, async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id, deletedAt: null },
    include: {
      team: {
        include: {
          organization: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  const safeUser = excludeFields(user as Record<string, unknown>, ['passwordHash', 'refreshToken']);

  res.status(200).json({ user: safeUser });
});

export default router;
