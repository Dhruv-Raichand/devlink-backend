import express from 'express';
const userRouter = express.Router();
import userAuth from '../middlewares/auth.js';
import {
  getFeed,
  getReceivedRequests,
  getConnections,
  getSentRequests,
} from '../controllers/user.controller.js';

userRouter.get('/user/requests/received', userAuth, getReceivedRequests);

userRouter.get('/user/requests/sent', userAuth, getSentRequests);

userRouter.get('/user/connections', userAuth, getConnections);

userRouter.get('/feed', userAuth, getFeed);

export default userRouter;
