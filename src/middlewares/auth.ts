import jwt, { JwtPayload } from 'jsonwebtoken';
import User from '../models/user.js';
import { Response, Request, NextFunction } from 'express';

export const userAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication Required',
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY!
    ) as JwtPayload;

    if (typeof decoded === 'object' && decoded !== null && '_id' in decoded) {
      const _id = decoded._id as string;

      const user = await User.findById(_id);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid authentication token',
        });
      }

      req.user = user;
      next();
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token payload',
      });
    }
  } catch (err: any) {
    console.error('Auth error:', err.message);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};
