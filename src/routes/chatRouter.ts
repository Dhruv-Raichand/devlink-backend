import express from 'express';
const chatRouter = express.Router();
import userAuth from '../middlewares/auth.js';
import Chat from '../models/chat.js';
import { Types } from 'mongoose';

interface PopulatedUser {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  photoUrl: string;
}

chatRouter.get(
  '/chat/recent',
  userAuth,
  async (req: any, res: any): Promise<void> => {
    try {
      const userId = req.user._id;

      const chats = await Chat.find({
        participants: userId,
        'messages.0': { $exists: true },
      })
        .populate<{ participants: PopulatedUser[] }>(
          'participants',
          'firstName lastName photoUrl'
        )
        .sort({ updatedAt: -1 })
        .limit(20);

      const data = chats
        .map((chat) => {
          const other = chat.participants.find(
            (p) => p._id.toString() !== userId.toString()
          );

          if (!other) return null; // guard — skip if somehow missing

          const last = chat.messages[chat.messages.length - 1];

          return {
            userId: other._id,
            firstName: other.firstName,
            lastName: other.lastName,
            photoUrl: other.photoUrl,
            lastMessage: last?.text || '',
            lastMessageAt: last?.createdAt || (chat as any).updatedAt,
          };
        })
        .filter(Boolean); // remove any nulls

      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

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

export default chatRouter;
