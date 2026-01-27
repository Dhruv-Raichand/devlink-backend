const socket = require("socket.io");
const crypto = require("crypto");
const Chat = require("../models/chat");

const getSecretRoomId = (userId, targetUserId) => {
  return crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("_"))
    .digest("hex");
};

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinChat", ({ firstName, userId, targetUserId }) => {
      const roomId = getSecretRoomId(userId, targetUserId);
      console.log(firstName + " Joining Room: " + roomId);
      socket.join(roomId);
    });
    socket.on(
      "sendMessage",
      async ({ firstName, lastName, photoUrl, userId, targetUserId, text }) => {
        try {
          const roomId = getSecretRoomId(userId, targetUserId);
          console.log(firstName + ": " + text);

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

          chat.messages.push({
            senderId: userId,
            text,
          });

          await chat.save();
          const savedMessage = chat.messages[chat.messages.length - 1];
          io.to(roomId).emit("messageReceived", {
            firstName,
            lastName,
            photoUrl,
            text,
            createdAt: savedMessage.createdAt, // send the DB timestamp
          });
        } catch (err) {
          console.log(err);
        }
      },
    );
    socket.on("disconnect", () => {});
  });
};
module.exports = initializeSocket;
