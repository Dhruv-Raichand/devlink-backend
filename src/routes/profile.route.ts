import Express from 'express';
const profileRouter = Express.Router();
import userAuth from '../middlewares/auth.js';
import {
  changePassword,
  editProfile,
  getProfile,
  viewUserProfile,
  completeOnboarding,
} from '../controllers/profile.controller.js';

profileRouter.get('/', userAuth, getProfile);

profileRouter.patch('/edit', userAuth, editProfile);

profileRouter.patch('/password', userAuth, changePassword);

profileRouter.get('/:userId', userAuth, viewUserProfile);

profileRouter.post('/onboarding/complete', userAuth, completeOnboarding);

export default profileRouter;
