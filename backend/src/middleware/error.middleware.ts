import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.util';
import { logger } from '../config/logger';
import { ZodError } from 'zod';

export function errorHandler(
  err: Error | ZodError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log the error
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const errors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors,
    });
    return;
  }

  // Handle known errors
  if (err.message) {
    const statusCode = (err as any).statusCode || 500;
    sendError(res, err.message, statusCode);
    return;
  }

  // Handle unknown errors
  sendError(res, 'Internal server error', 500);
}

// 404 handler
export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  sendError(res, `Route ${req.method} ${req.path} not found`, 404);
}

