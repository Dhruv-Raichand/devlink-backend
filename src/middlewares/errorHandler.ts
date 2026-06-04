import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError.js';

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    err.code === 11000
  ) {
    return res.status(409).json({
      success: false,
      message: 'Resource already exists',
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  console.error(err);

  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
  });
};
