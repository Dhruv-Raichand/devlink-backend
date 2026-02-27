import { Server } from 'socket.io';
import crypto from 'crypto';
import Chat, { IMessageInput } from '../models/chat.js';

const getSecretRoomId = (userId: string, targetUserId: string): string => {
  return crypto
    .createHash('sha256')
    .update([userId, targetUserId].sort().join('_'))
    .digest('hex');
};

const initializeSocket = (server: any): void => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
  });

  io.on('connection', (socket: any) => {
    socket.on('joinChat', ({ firstName, userId, targetUserId }: any) => {
      const roomId = getSecretRoomId(userId, targetUserId);
      console.log(firstName + ' Joining Room: ' + roomId);
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
          console.log(firstName + ': ' + text);

          //save to DB
          let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] },
          });

          if (!chat) {
            chat = new Chat({
              participants: [userId, targetUserId],
              messages: [],
            });
          }

          const message: IMessageInput = {
            senderId: userId,
            text,
          };

          chat.messages.push(message);

          await chat.save();
          const savedMessage = chat.messages.at(-1);
          if (!savedMessage) return;

          io.to(roomId).emit('messageReceived', {
            firstName,
            lastName,
            photoUrl,
            text,
            createdAt: savedMessage.createdAt, // send the DB timestamp
          });
        } catch (err) {
          console.log(err);
        }
      }
    );
    socket.on('disconnect', () => {});
  });
};

export default initializeSocket;
