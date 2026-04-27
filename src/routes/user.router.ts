import express from 'express';
const userRouter = express.Router();
import userAuth from '../middlewares/auth.js';
import {
  getFeed,
  getReceivedRequests,
  getConnections,
  getSentRequests,
} from '../controllers/user.controller.js';

userRouter.get('/requests/received', userAuth, getReceivedRequests);

userRouter.get('/requests/sent', userAuth, getSentRequests);

userRouter.get('/connections', userAuth, getConnections);

userRouter.get('/feed', userAuth, getFeed);

export default userRouter;
