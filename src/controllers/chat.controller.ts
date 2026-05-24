import Chat from '../models/chat.js';
import { PopulatedUser } from '../types/chat.types.js';
import { Request, Response } from 'express';

export const recentChat = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    const chats = await Chat.find({
      participants: user._id,
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
          (p) => p._id.toString() !== user._id.toString()
        );

        if (!other) return null;

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
};

export const chatWithUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { targetUserId } = req.params as { targetUserId: string };
  const user = req.user;

  if (!user) {
    res.status(401).json({
      success: false,
      message: 'Unauthorized',
    });
    return;
  }

  try {
    let chat = await Chat.findOne({
      participants: { $all: [user._id, targetUserId], $size: 2 },
    }).populate({
      path: 'messages.senderId',
      select: 'firstName lastName photoUrl',
    });

    if (!chat) {
      chat = new Chat({
        participants: [user._id, targetUserId],
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
};
