import 'express-async-errors';
import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate } from '../config/auth.middleware';
import { AppError } from '../config/error.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// ─── GET / — User's notifications ────────────────────────────────────────────

router.get('/', async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string, 10) || 20));
  const skip = (page - 1) * limit;

  const unreadOnly = req.query.unreadOnly === 'true';

  const where: Record<string, unknown> = {
    userId: req.user!.id,
  };

  if (unreadOnly) {
    where.read = false;
  }

  const [data, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      skip,
      take: limit,
      orderBy: [
        { read: 'asc' },
        { createdAt: 'desc' },
      ],
    }),
    prisma.notification.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    data,
    total,
    page,
    totalPages,
  });
});

// ─── POST /read-all — Mark all notifications as read ─────────────────────────
// NOTE: Must be placed BEFORE /:id routes to avoid route conflicts

router.post('/read-all', async (req: Request, res: Response) => {
  const result = await prisma.notification.updateMany({
    where: {
      userId: req.user!.id,
      read: false,
    },
    data: { read: true },
  });

  res.status(200).json({ updated: result.count });
});

// ─── PATCH /:id/read — Mark single notification as read ──────────────────────

router.patch('/:id/read', async (req: Request, res: Response) => {
  const notification = await prisma.notification.findUnique({
    where: { id: req.params.id },
  });

  if (!notification) {
    throw new AppError(404, 'Notification not found');
  }

  if (notification.userId !== req.user!.id) {
    throw new AppError(403, 'Not authorized to update this notification');
  }

  const updated = await prisma.notification.update({
    where: { id: req.params.id },
    data: { read: true },
  });

  res.status(200).json(updated);
});

export default router;
