const express = require("express");
const userRouter = express.Router();
const connectionRequest = require("../models/connection");
const { userAuth } = require("../middlewares/auth");

userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const SAFE_USER_FIELDS = "_id firstName lastName about";
    const loggedInUser = req.user;
    const requests = await connectionRequest
      .find({ toUserId: loggedInUser._id, status: "interested" })
      .populate("fromUserId", SAFE_USER_FIELDS);
    if (requests.length === 0) {
      throw new Error("No Recieved Requests!!!");
    }
    const received = requests.map(({ _id, fromUserId }) => ({
      _id,
      fromUserId,
    }));
    res.json({
      message: "received requests",
      received,
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
});
userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const SAFE_USER_FIELDS = "_id firstName lastName about";
    const connections = await connectionRequest
      .find({
        $or: [
          { toUserId: loggedInUser._id, status: "accepted" },
          { fromUserId: loggedInUser._id, status: "accepted" },
        ],
      })
      .populate("fromUserId", SAFE_USER_FIELDS)
      .populate("toUserId", SAFE_USER_FIELDS);
    if (connections.length === 0) {
      throw new Error("No Connections");
    }
    const connectionUsers = connections.map((row) => {
      if (loggedInUser._id.toString() === row.toUserId._id.toString()) {
        return row.fromUserId;
      } else {
        return row.toUserId;
      }
    });
    res.json({
      message: "Connections",
      connectionUsers,
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
});

module.exports = userRouter;
