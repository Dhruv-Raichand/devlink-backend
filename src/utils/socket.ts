import { Server, Socket } from 'socket.io';
import crypto from 'crypto';
import Chat, { IMessageInput } from '../models/chat.js';
import { Server as HttpServer } from 'http';
import { logger } from '../logger/logger.js';

const getSecretRoomId = (userId: string, targetUserId: string): string => {
  return crypto
    .createHash('sha256')
    .update([userId, targetUserId].sort().join('_'))
    .digest('hex');
};

export const onlineUsers = new Map<string, string>();
export let io: Server;

const initializeSocket = (server: HttpServer): Server => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
  });

  io.on('connection', (socket: Socket) => {
    socket.on('register', (userId: string) => {
      onlineUsers.set(userId, socket.id);
      io.emit('userOnline', userId);
      socket.emit('onlineList', Array.from(onlineUsers.keys()));
      logger.info(
        { userId, socketId: socket.id },
        'User connected with socket'
      );
    });

    socket.on('joinChat', ({ userId, targetUserId }: any) => {
      const roomId = getSecretRoomId(userId, targetUserId);
      socket.join(roomId);
    });

    socket.on(
      'sendMessage',
      async ({
        firstName,
        lastName,
        photoUrl,
        userId,
        targetUserId,
        text,
      }: any) => {
        try {
          const roomId = getSecretRoomId(userId, targetUserId);

          let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] },
          });

          if (!chat) {
            chat = new Chat({
              participants: [userId, targetUserId],
              messages: [],
            });
          }

          const message: IMessageInput = { senderId: userId, text };
          chat.messages.push(message);
          await chat.save();

          const savedMessage = chat.messages.at(-1);
          if (!savedMessage) return;

          io.to(roomId).emit('messageReceived', {
            firstName,
            lastName,
            photoUrl,
            text,
            createdAt: savedMessage.createdAt,
          });

          const targetSocketId = onlineUsers.get(targetUserId);
          if (targetSocketId) {
            io.to(targetSocketId).emit('newNotification', {
              type: 'message',
              from: firstName,
              text,
              targetUserId: userId,
            });
          }
        } catch (err) {
          logger.error({ err }, 'Socket message failed');
        }
      }
    );

    socket.on('disconnect', () => {
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          io.emit('userOffline', userId);
          logger.info({ socketId: socket.id }, 'Socket disconnected');
          break;
        }
      }
    });
  });

  return io;
};

export const closeSocket = (): Promise<void> => {
  return new Promise((resolve) => {
    if (!io) {
      resolve();
      return;
    }

    io.close(() => {
      logger.info('Socket server closed');
    });
  });
};

export default initializeSocket;
