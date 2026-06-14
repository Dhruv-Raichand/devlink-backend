import { randomUUID } from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../logger/logger.js';

export function requestId(req: Request, res: Response, next: NextFunction) {
  const id = req.headers['x-request-id'] || randomUUID();

  req.requestId = id as string;

  res.setHeader('x-request-id', id);

  req.log = logger.child({
    requestId: id,
  });

  next();
}
