import jwt, { JwtPayload } from 'jsonwebtoken';
import User from '../models/user.js';
import { Response, Request, NextFunction } from 'express';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { logger } from '../logger/logger.js';

const userAuth = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { accessToken } = req.cookies;
    if (!accessToken) {
      logger.warn(
        { requestId: req.requestId, path: req.originalUrl },
        'Authentication failed: missing access token'
      );
      throw new ApiError(401, 'Authentication Required');
    }

    const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET_KEY;
    if (!ACCESS_SECRET) {
      logger.error(
        { requestId: req.requestId },
        'Access token secret is missing'
      );
      throw new ApiError(500, 'Server configuration error');
    }

    let decoded: JwtPayload & { userId?: string };

    try {
      decoded = jwt.verify(accessToken, ACCESS_SECRET) as JwtPayload & {
        userId?: string;
      };
    } catch {
      logger.warn(
        { requestId: req.requestId, path: req.originalUrl },
        'Authentication failed: invalid or expired token'
      );
      throw new ApiError(401, 'Invalid or expired access token');
    }

    if (!decoded.userId) {
      logger.warn(
        { requestId: req.requestId, path: req.originalUrl },
        'Authentication failed: missing user id in token'
      );

      throw new ApiError(401, 'Invalid token');
    }

    const userId = decoded.userId;

    const user = await User.findById(userId).select('-password -refreshToken');

    if (!user) {
      logger.warn(
        { requestId: req.requestId, userId },
        'Authentication failed: user not found'
      );
      throw new ApiError(401, 'User not found');
    }

    req.user = user;

    logger.debug(
      { requestId: req.requestId, userId: user._id },
      'User authenticated'
    );

    return next();
  }
);

export default userAuth;
