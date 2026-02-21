const Express = require('express');
const profileRouter = Express.Router();
const { userAuth } = require('../middlewares/auth');
const { validateUserEdit } = require('../utils/validate');
const bcrypt = require('bcrypt');
const validator = require('validator');
const { sanitizeUser } = require('../utils/helper');

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

module.exports = profileRouter;
export {};
