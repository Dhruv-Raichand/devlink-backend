import Express from 'express';
const profileRouter = Express.Router();
import userAuth from '../middlewares/auth.js';
import { validateUserEdit } from '../utils/validate.js';
import bcrypt from 'bcrypt';
import validator from 'validator';
import sanitizeUser from '../utils/helper.js';
import User from '../models/user.js';

//profile
profileRouter.get(
  '/profile',
  userAuth,
  async (req: any, res: any): Promise<void> => {
    try {
      const user = req.user;
      res.json({
        success: true,
        data: sanitizeUser(user),
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message,
      });
    }
  }
);

//edit
profileRouter.patch(
  '/profile/edit',
  userAuth,
  async (req: any, res: any): Promise<void> => {
    try {
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
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message,
      });
    }
  }
);

//change password
profileRouter.patch(
  '/profile/password',
  userAuth,
  async (req: any, res: any): Promise<void> => {
    try {
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
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message,
      });
    }
  }
);

// view another user's profile
profileRouter.get(
  '/profile/:userId',
  userAuth,
  async (req: any, res: any): Promise<void> => {
    try {
      const { userId } = req.params;

      if (!validator.isMongoId(userId)) {
        throw new Error('Invalid userId');
      }

      const SAFE_USER_FIELDS =
        '_id firstName lastName about photoUrl skills age gender';

      const user = await User.findById(userId).select(SAFE_USER_FIELDS);

      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      res.json({ success: true, data: user });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
);

export default profileRouter;
