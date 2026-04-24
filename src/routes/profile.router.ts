import Express from 'express';
const profileRouter = Express.Router();
import userAuth from '../middlewares/auth.js';
import {
  changePassword,
  editProfile,
  getProfile,
  viewUserProfile,
} from '../controllers/profile.controller.js';

profileRouter.get('/profile', userAuth, getProfile);

profileRouter.patch('/profile/edit', userAuth, editProfile);

profileRouter.patch('/profile/password', userAuth, changePassword);

profileRouter.get('/profile/:userId', userAuth, viewUserProfile);

export default profileRouter;
