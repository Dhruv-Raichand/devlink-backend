import { validateUserEdit } from '../utils/validate.js';
import bcrypt from 'bcrypt';
import validator from 'validator';
import { sanitizeUser, toSelectString } from '../utils/helper.js';
import User from '../models/user.js';
import { PROFILE_USER_FIELDS } from '../utils/constants.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getProfile = asyncHandler(
  async (req: any, res: any): Promise<void> => {
    const user = req.user;
    res.json({
      success: true,
      data: sanitizeUser(user),
    });
  }
);

export const editProfile = asyncHandler(
  async (req: any, res: any): Promise<void> => {
    if (!validateUserEdit(req.body)) {
      throw new Error('Invalid update request');
    }

    let loggedInUser = req.user;

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
  async (req: any, res: any): Promise<void> => {
    const { password, newPassword } = req.body;
    if (!password || !newPassword) {
      throw new Error('current password and new password is required');
    } else if (password === newPassword) {
      throw new Error('new password should not be same as current password');
    } else if (!validator.isStrongPassword(newPassword)) {
      throw new Error('new password is weak');
    }
    const loggedInUser = req.user;
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
      throw new Error('password is not matched');
    }
  }
);

export const viewUserProfile = asyncHandler(
  async (req: any, res: any): Promise<void> => {
    const { userId } = req.params;

    if (!validator.isMongoId(userId)) {
      throw new Error('Invalid userId');
    }

    const user = await User.findById(userId).select(
      toSelectString(PROFILE_USER_FIELDS)
    );

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.json({ success: true, data: user });
  }
);

export const completeOnboarding = asyncHandler(
  async (req: any, res: any): Promise<void> => {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { onboardingComplete: true } },
      { new: true }
    );
    res.json({ success: true, data: sanitizeUser(user) });
  }
);
