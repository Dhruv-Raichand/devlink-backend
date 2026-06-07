import jwt, { JwtPayload } from 'jsonwebtoken';
import User from '../models/user.js';
import { Response, Request, NextFunction } from 'express';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const userAuth = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { accessToken } = req.cookies;
    if (!accessToken) {
      throw new ApiError(401, 'Authentication Required');
    }

    const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET_KEY;
    if (!ACCESS_SECRET) {
      throw new ApiError(500, 'Server configuration error');
    }

    let decoded: JwtPayload & { userId: string };

    try {
      decoded = jwt.verify(accessToken, ACCESS_SECRET) as JwtPayload & {
        userId: string;
      };
    } catch {
      throw new ApiError(401, 'Invalid or expired access token');
    }

    const userId = decoded.userId;

    const user = await User.findById(userId).select('-password -refreshToken');

    if (!user) {
      throw new ApiError(401, 'User not found');
    }

    req.user = user;
    return next();
  }
);

export default userAuth;
