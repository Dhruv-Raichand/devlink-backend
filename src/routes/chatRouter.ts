const express = require('express');
const { userAuth } = require('../middlewares/auth');
const chatRouter = express.Router();
const Chat = require('../models/chat');

chatRouter.get(
  '/chat/:targetUserId',
  userAuth,
  async (req: any, res: any): Promise<void> => {
    const { targetUserId } = req.params as { targetUserId: string };
    const userId = req.user._id;
    try {
      let chat = await Chat.findOne({
        participants: { $all: [userId, targetUserId] },
      }).populate({
        path: 'messages.senderId',
        select: 'firstName lastName photoUrl',
      });

      if (!chat) {
        chat = new Chat({
          participants: [userId, targetUserId],
          messages: [],
        });
        await chat.save();
      }
      res.json({
        success: true,
        data: chat,
      });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch chat',
      });
    }
  }
);

module.exports = chatRouter;
export {};
