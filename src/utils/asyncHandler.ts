import { Request, Response, NextFunction, RequestHandler } from 'express';

export const asyncHandler =
  (
    fn: (...args: Parameters<RequestHandler>) => Promise<void>
  ): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
