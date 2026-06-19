import { validateUserEdit } from '../utils/validate.js';
import bcrypt from 'bcrypt';
import validator from 'validator';
import { sanitizeUser, toSelectString } from '../utils/helper.js';
import User from '../models/user.js';
import { PROFILE_USER_FIELDS } from '../utils/constants.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Request, Response } from 'express';
import { ApiError } from '../utils/apiError.js';
import { SendResponse } from '../utils/sendResponse.js';

export const getProfile = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const user = req.user;
    if (!user) {
      req.log.warn('Unauthrized access');
      throw new ApiError(401, 'Unauthorized');
    }
    req.log.info({ userId: user._id }, 'Profile retrieved');
    SendResponse(
      res,
      200,
      'Profile retrieved successfully',
      sanitizeUser(user)
    );
  }
);

export const editProfile = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    let loggedInUser = req.user;
    if (!loggedInUser) {
      req.log.warn('Unauthrized access');
      throw new ApiError(401, 'Unauthorized');
    }

    if (!validateUserEdit(req.body)) {
      req.log.warn({ requestBody: req.body }, 'Invalid req.body');
      throw new ApiError(400, 'Invalid update request');
    }

    delete req.body.password;

    Object.assign(loggedInUser, req.body);

    await loggedInUser.save();

    req.log.info({ userId: loggedInUser._id }, 'Profile updated successfully');

    SendResponse(
      res,
      200,
      'Profile updated successfully',
      sanitizeUser(loggedInUser)
    );
  }
);

export const changePassword = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { password, newPassword } = req.body;

    const loggedInUser = req.user;
    if (!loggedInUser) {
      req.log.warn('Unauthorized password change attempt');
      throw new ApiError(401, 'Unauthorized');
    }

    if (!password || !newPassword) {
      req.log.warn({ userId: loggedInUser._id }, 'Password change missing fields');
      throw new ApiError(400, 'Current password and new password are required');
    } else if (password === newPassword) {
      req.log.warn({ userId: loggedInUser._id }, 'New password same as current');
      throw new ApiError(
        400,
        'New password should not be the same as the current password'
      );
    } else if (!validator.isStrongPassword(newPassword)) {
      req.log.warn({ userId: loggedInUser._id }, 'New password too weak');
      throw new ApiError(400, 'New password is weak');
    }

    const isCorrect = await bcrypt.compare(password, loggedInUser.password);
    if (isCorrect) {
      const newPasswordHash = await bcrypt.hash(newPassword, 10);
      loggedInUser.password = newPasswordHash;

      await loggedInUser.save();

      req.log.info(
        { userId: loggedInUser._id },
        'Password updated successfully'
      );

      SendResponse(
        res,
        200,
        'Password updated successfully',
        sanitizeUser(loggedInUser)
      );
    } else {
      req.log.warn({ userId: loggedInUser._id }, 'Incorrect current password');
      throw new ApiError(400, 'Current password is incorrect');
    }
  }
);

export const viewUserProfile = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params;

    if (typeof userId !== 'string' || !validator.isMongoId(userId)) {
      req.log.warn({ userId }, 'Invalid request parameter');
      throw new ApiError(400, 'Invalid userId');
    }

    const user = await User.findById(userId).select(
      toSelectString(PROFILE_USER_FIELDS)
    );

    if (!user) {
      req.log.warn({ userId }, 'User not found in database');
      throw new ApiError(404, 'User not found');
    }

    req.log.info({ userId }, 'Fetching user profile');

    SendResponse(
      res,
      200,
      'User profile retrieved successfully',
      sanitizeUser(user)
    );
  }
);

export const completeOnboarding = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      req.log.warn('Unauthorized request');
      throw new ApiError(401, 'Unauthorized');
    }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { onboardingComplete: true } },
      { new: true }
    );

    if (!user) {
      req.log.warn({ userId: req.user._id }, 'User not found in database');
      throw new ApiError(404, 'User not found');
    }

    req.log.info({ userId: user._id }, 'Onboarding completed successfully');

    SendResponse(
      res,
      200,
      'Onboarding completed successfully',
      sanitizeUser(user)
    );
  }
);
