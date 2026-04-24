import Express from 'express';
const requestRouter = Express.Router();
import userAuth from '../middlewares/auth.js';
import {
  reviewRequest,
  sendRequest,
} from '../controllers/request.controller.js';

requestRouter.post('/request/send/:status/:toUserId', userAuth, sendRequest);

requestRouter.post(
  '/request/review/:status/:requestId',
  userAuth,
  reviewRequest
);

export default requestRouter;
