import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError.js';

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof ApiError) {
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code: number }).code === 11000
    ) {
      const keyValue = (err as { keyValue?: Record<string, undefined> })
        .keyValue;
      req.log.warn(
        {
          code: err.code,
          field: keyValue ? Object.keys(keyValue)[0] : 'unknown',
        },
        'Duplicate Resource'
      );

      return res.status(409).json({
        success: false,
        message: 'Resource already exists',
      });
    }

    const level =
      err.statusCode >= 500
        ? 'error'
        : err.statusCode === 401 ||
            err.statusCode === 403 ||
            err.statusCode === 429
          ? 'warn'
          : 'info';

    req.log[level](
      {
        statusCode: err.statusCode,
        message: err.message,
        userId: req.user?._id,
        path: req.originalUrl,
      },
      'API error'
    );

    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }
  const stack = err instanceof Error ? err.stack : 'undefined';
  req.log.error({ err, stack }, 'Unhandled error');

  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
  });
};
