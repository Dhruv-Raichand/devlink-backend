import express from 'express';
const chatRouter = express.Router();
import userAuth from '../middlewares/auth.js';
import { chatWithUser, recentChat } from '../controllers/chat.controller.js';

chatRouter.get('/chat/recent', userAuth, recentChat);

chatRouter.get('/chat/:targetUserId', userAuth, chatWithUser);

export default chatRouter;
