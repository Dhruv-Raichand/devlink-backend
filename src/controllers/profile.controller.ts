import { validateUserEdit } from '../utils/validate.js';
import bcrypt from 'bcrypt';
import validator from 'validator';
import { sanitizeUser, toSelectString } from '../utils/helper.js';
import User from '../models/user.js';
import { PROFILE_USER_FIELDS } from '../utils/constants.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Request, Response } from 'express';
import { ApiError } from '../utils/apiError.js';

export const getProfile = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const user = req.user;
    res.json({
      success: true,
      data: sanitizeUser(user),
    });
  }
);

export const editProfile = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!validateUserEdit(req.body)) {
      throw new ApiError(400, 'Invalid update request');
    }

    let loggedInUser = req.user;
    if (!loggedInUser) {
      throw new ApiError(401, 'Unauthorized');
    }

    delete req.body.password;

    Object.assign(loggedInUser, req.body);

    await loggedInUser.save();
    const firstName = loggedInUser.firstName;
    res.json({
      success: true,
      message: `${firstName}, your profile is updated successfully!!`,
      data: sanitizeUser(loggedInUser),
    });
  }
);

export const changePassword = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { password, newPassword } = req.body;
    if (!password || !newPassword) {
      throw new ApiError(400, 'Current password and new password are required');
    } else if (password === newPassword) {
      throw new ApiError(
        400,
        'New password should not be the same as the current password'
      );
    } else if (!validator.isStrongPassword(newPassword)) {
      throw new ApiError(400, 'New password is weak');
    }

    const loggedInUser = req.user;
    if (!loggedInUser) {
      throw new ApiError(401, 'Unauthorized');
    }

    const isCorrect = await bcrypt.compare(password, loggedInUser.password);
    if (isCorrect) {
      const newPasswordHash = await bcrypt.hash(newPassword, 10);
      loggedInUser.password = newPasswordHash;

      await loggedInUser.save();

      res.json({
        success: true,
        message: 'password update successfully',
        data: sanitizeUser(loggedInUser),
      });
    } else {
      throw new ApiError(400, 'Current password is incorrect');
    }
  }
);

export const viewUserProfile = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params;

    if (typeof userId !== 'string' || !validator.isMongoId(userId)) {
      throw new ApiError(400, 'Invalid userId');
    }

    const user = await User.findById(userId).select(
      toSelectString(PROFILE_USER_FIELDS)
    );

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    res.json({ success: true, data: user });
  }
);

export const completeOnboarding = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      throw new ApiError(401, 'Unauthorized');
    }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { onboardingComplete: true } },
      { new: true }
    );
    res.json({ success: true, data: sanitizeUser(user) });
  }
);
