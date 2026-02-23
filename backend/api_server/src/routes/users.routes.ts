import 'express-async-errors';
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { authenticate } from '../config/auth.middleware';
import { requireRole } from '../config/rbac.middleware';
import { validate } from '../config/validate.middleware';
import { uploadAvatar } from '../config/upload.middleware';
import { AppError } from '../config/error.middleware';
import { deleteFile } from '../lib/s3';

const router = Router();

// All routes require authentication
router.use(authenticate);

// ─── Zod Schemas ────────────────────────────────────────────────────────────────

const updateUserSchema = z.object({
  fullName: z.string().min(1, 'Full name cannot be empty').optional(),
  sport: z.string().optional(),
  teamId: z.string().uuid('Invalid team ID').optional(),
});

// ─── Helpers ────────────────────────────────────────────────────────────────────

const EXCLUDED_FIELDS = {
  passwordHash: true,
  refreshToken: true,
} as const;

const USER_SELECT = {
  id: true,
  email: true,
  username: true,
  fullName: true,
  role: true,
  sport: true,
  avatarUrl: true,
  teamId: true,
  createdAt: true,
  updatedAt: true,
  passwordHash: false,
  refreshToken: false,
} as const;

// ─── GET / — List users ─────────────────────────────────────────────────────────

router.get(
  '/',
  requireRole('COACH', 'MANAGER'),
  async (req: Request, res: Response) => {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string, 10) || 20));
    const skip = (page - 1) * limit;

    const { role, teamId, search } = req.query as {
      role?: string;
      teamId?: string;
      search?: string;
    };

    const where: Record<string, unknown> = {
      deletedAt: null,
    };

    if (role) {
      where.role = role;
    }

    if (teamId) {
      where.teamId = teamId;
    }

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: USER_SELECT,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      data,
      total,
      page,
      totalPages,
    });
  },
);

// ─── GET /:id — Get user ────────────────────────────────────────────────────────

router.get('/:id', async (req: Request, res: Response) => {
  const user = await prisma.user.findFirst({
    where: { id: req.params.id, deletedAt: null },
    include: { team: true },
  });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  // Exclude sensitive fields
  const { passwordHash, refreshToken, ...safeUser } = user;

  res.status(200).json(safeUser);
});

// ─── PATCH /:id — Update user ────────────────────────────────────────────────────

router.patch(
  '/:id',
  uploadAvatar,
  validate({ body: updateUserSchema }),
  async (req: Request, res: Response) => {
    const targetId = req.params.id;
    const currentUser = req.user!;

    // Authorization: user can update own profile, or MANAGER can update anyone
    if (currentUser.id !== targetId && currentUser.role !== 'MANAGER') {
      throw new AppError(403, 'You can only update your own profile');
    }

    // Verify target user exists
    const existingUser = await prisma.user.findFirst({
      where: { id: targetId, deletedAt: null },
    });

    if (!existingUser) {
      throw new AppError(404, 'User not found');
    }

    const updateData: Record<string, unknown> = {};

    // Apply validated body fields
    const { fullName, sport, teamId } = req.body;
    if (fullName !== undefined) updateData.fullName = fullName;
    if (sport !== undefined) updateData.sport = sport;
    if (teamId !== undefined) updateData.teamId = teamId;

    // Handle avatar upload via multer-s3
    const file = req.file as Express.MulterS3.File | undefined;
    if (file) {
      // Delete old avatar from S3 if it exists
      if (existingUser.avatarUrl) {
        try {
          const url = new URL(existingUser.avatarUrl);
          const oldKey = url.pathname.slice(1); // remove leading "/"
          await deleteFile(oldKey);
        } catch {
          // Ignore errors when deleting old avatar
        }
      }
      updateData.avatarUrl = file.location;
    }

    const updatedUser = await prisma.user.update({
      where: { id: targetId },
      data: updateData,
      select: USER_SELECT,
    });

    res.status(200).json(updatedUser);
  },
);

// ─── DELETE /:id — Soft delete ───────────────────────────────────────────────────

router.delete('/:id', async (req: Request, res: Response) => {
  const targetId = req.params.id;
  const currentUser = req.user!;

  // Authorization: MANAGER or self-delete
  if (currentUser.id !== targetId && currentUser.role !== 'MANAGER') {
    throw new AppError(403, 'Insufficient permissions');
  }

  // Verify target user exists and is not already deleted
  const existingUser = await prisma.user.findFirst({
    where: { id: targetId, deletedAt: null },
  });

  if (!existingUser) {
    throw new AppError(404, 'User not found');
  }

  await prisma.user.update({
    where: { id: targetId },
    data: { deletedAt: new Date() },
  });

  res.status(200).json({ message: 'User deleted' });
});

export default router;
