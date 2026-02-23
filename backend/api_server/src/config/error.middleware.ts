import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { logger } from './logger';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const requestId = req.requestId || 'unknown';

  // App-level errors
  if (err instanceof AppError) {
    logger.warn(`AppError: ${err.message}`, {
      requestId,
      statusCode: err.statusCode,
      path: req.path,
    });
    res.status(err.statusCode).json({
      error: err.message,
      details: err.details,
      requestId,
    });
    return;
  }

  // Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const prismaError = handlePrismaError(err);
    logger.warn(`PrismaError: ${prismaError.message}`, {
      requestId,
      code: err.code,
      path: req.path,
    });
    res.status(prismaError.status).json({
      error: prismaError.message,
      requestId,
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    logger.warn('Prisma validation error', { requestId, path: req.path });
    res.status(400).json({
      error: 'Invalid data provided',
      requestId,
    });
    return;
  }

  // Multer errors
  if (err.name === 'MulterError') {
    logger.warn(`MulterError: ${err.message}`, { requestId, path: req.path });
    res.status(400).json({
      error: `Upload error: ${err.message}`,
      requestId,
    });
    return;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    res.status(401).json({ error: 'Invalid or expired token', requestId });
    return;
  }

  // Default: unexpected error
  logger.error('Unhandled error', {
    requestId,
    error: err.message,
    stack: err.stack,
    path: req.path,
  });

  res.status(500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    requestId,
  });
}

function handlePrismaError(err: Prisma.PrismaClientKnownRequestError) {
  switch (err.code) {
    case 'P2002':
      return { status: 409, message: `Duplicate value for unique field: ${(err.meta?.target as string[])?.join(', ')}` };
    case 'P2025':
      return { status: 404, message: 'Record not found' };
    case 'P2003':
      return { status: 400, message: 'Foreign key constraint failed' };
    case 'P2014':
      return { status: 400, message: 'Relation violation' };
    default:
      return { status: 400, message: `Database error: ${err.code}` };
  }
}
