import Express from 'express';
const requestRouter = Express.Router();
import userAuth from '../middlewares/auth.js';
import {
  reviewRequest,
  sendRequest,
  removeConnection,
  withdrawRequest,
} from '../controllers/request.controller.js';

requestRouter.post('/send/:status/:toUserId', userAuth, sendRequest);

requestRouter.post('/review/:status/:requestId', userAuth, reviewRequest);

requestRouter.delete('/withdraw/:requestId', userAuth, withdrawRequest);

requestRouter.delete('/connection/:userId', userAuth, removeConnection);

export default requestRouter;
