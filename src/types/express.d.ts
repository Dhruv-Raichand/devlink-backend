import { IUser } from '../models/user.ts';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;

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
