import { randomUUID } from 'crypto';
import { Request, Response, NextFunction } from 'express';

export function requestId(req: Request, res: Response, next: NextFunction) {
  const id = randomUUID();

  req.requestId = id;
  res.setHeader('x-request-id', id);

  next();
}
