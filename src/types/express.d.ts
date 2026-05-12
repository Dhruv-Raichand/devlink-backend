import { IUser } from '../models/user.js';

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
