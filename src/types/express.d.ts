import { UserDocument } from '../models/user.js';

declare global {
  namespace Express {
    interface Request {
      requestId: string;

      user?: UserDocument;

      rateLimit?: {
        limit: number;
        current: number;
        remaining: number;
        resetTime: Date;
      };
    }
  }
}

export {};
