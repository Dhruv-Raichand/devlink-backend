import Express from 'express';
const requestRouter = Express.Router();
import userAuth from '../middlewares/auth.js';
import {
  reviewRequest,
  sendRequest,
  removeConnection,
  withdrawRequest,
} from '../controllers/request.controller.js';

requestRouter.post('/request/send/:status/:toUserId', userAuth, sendRequest);

requestRouter.post(
  '/request/review/:status/:requestId',
  userAuth,
  reviewRequest
);

requestRouter.delete('/request/withdraw/:requestId', userAuth, withdrawRequest);

requestRouter.delete('/request/connection/:userId', userAuth, removeConnection);

export default requestRouter;
