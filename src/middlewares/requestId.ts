import { randomUUID } from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../logger/logger.js';

export function requestId(req: Request, res: Response, next: NextFunction) {
  const isValidUUID = (v: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      v
    );

  const incoming = req.headers['x-request-id'];

  const id =
    typeof incoming === 'string' && isValidUUID(incoming)
      ? incoming
      : randomUUID();

  req.requestId = id as string;

  res.setHeader('x-request-id', id);

  req.log = logger.child({
    requestId: id,
  });

  next();
}
