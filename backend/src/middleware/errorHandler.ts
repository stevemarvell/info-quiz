import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

const isProduction = process.env.NODE_ENV === 'production';

// Sanitize error details for production
const sanitizeDetails = (details: unknown): unknown => {
  if (!isProduction) {
    return details; // Show full details in development
  }

  // In production, only return safe, user-friendly information
  if (Array.isArray(details)) {
    return details.map(d => ({
      field: d.field || d.path,
      message: d.message
    }));
  }

  return undefined; // Don't expose internal details in production
};

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body
  });

  if (err instanceof AppError) {
    const response: {
      success: false;
      error: string;
      message: string;
      details?: unknown;
    } = {
      success: false,
      error: err.name,
      message: err.message
    };

    if (err.details) {
      response.details = sanitizeDetails(err.details);
    }

    res.status(err.statusCode).json(response);
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: 'ValidationError',
      message: 'Request validation failed',
      details: sanitizeDetails(err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message
      })))
    });
    return;
  }

  // Default error - never expose internal details
  res.status(500).json({
    success: false,
    error: 'InternalServerError',
    message: isProduction
      ? 'An unexpected error occurred'
      : err.message
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: 'NotFound',
    message: `Route ${req.path} not found`
  });
};

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void | Response>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
