import { IUser } from '../models/user.ts';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export {};
