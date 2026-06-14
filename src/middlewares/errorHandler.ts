import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError.js';

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const error = err as any;

  if (error?.code === 11000) {
    req.log.warn(
      { code: error.code, field: Object.keys(error.keyValue)[0] },
      'Duplicate Resource'
    );

    return res.status(409).json({
      success: false,
      message: 'Resource already exists',
    });
  }

  if (error instanceof ApiError) {
    req.log.warn(
      { statusCode: error.statusCode, message: error.message },
      'API error'
    );

    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  req.log.error({ err: error }, 'Unhandled error');

  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
  });
};
