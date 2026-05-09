import { Server } from 'socket.io';
import crypto from 'crypto';
import Chat, { IMessageInput } from '../models/chat.js';

const getSecretRoomId = (userId: string, targetUserId: string): string => {
  return crypto
    .createHash('sha256')
    .update([userId, targetUserId].sort().join('_'))
    .digest('hex');
};

export const onlineUsers = new Map<string, string>();
export let io: Server;

const initializeSocket = (server: any): Server => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
  });

  io.on('connection', (socket: any) => {
    socket.on('register', (userId: string) => {
      onlineUsers.set(userId, socket.id);
      io.emit('userOnline', userId);
      socket.emit('onlineList', Array.from(onlineUsers.keys()));
      console.log(`User ${userId} connected with socket ID ${socket.id}`);
    });

    socket.on('joinChat', ({ firstName, userId, targetUserId }: any) => {
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
          console.log(err);
        }
      }
    );

    socket.on('disconnect', () => {
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          io.emit('userOffline', userId);
          break;
        }
      }
    });
  });

  return io;
};

export default initializeSocket;
