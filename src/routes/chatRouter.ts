const express = require("express");
const { userAuth } = require("../middlewares/auth");
const chatRouter = express.Router();
const Chat = require("../models/chat");

chatRouter.get("/chat/:targetUserId", userAuth, async (req:any, res:any): Promise<void> => {
  const { targetUserId } = req.params as { targetUserId: string};
  const userId = req.user._id;
  try {
    let chat = await Chat.findOne({
      participants: { $all: [userId, targetUserId] },
    }).populate({
      path: "messages.senderId",
      select: "firstName lastName photoUrl",
    });

    if (!chat) {
      chat = new Chat({
        participants: [userId, targetUserId],
        messages: [],
      });
      await chat.save();
    }
    res.json(chat);
  } catch (err) {
    console.error(err);
  }
});

module.exports = chatRouter;
export{};