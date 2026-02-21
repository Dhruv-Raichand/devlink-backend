const express = require("express");
const userRouter = express.Router();
const connectionRequest = require("../models/connection");
const { userAuth } = require("../middlewares/auth");
const User = require("../models/user");

userRouter.get("/user/requests/received", userAuth, async (req:any, res:any): Promise<void> => {
  try {
    const SAFE_USER_FIELDS =
      "_id firstName lastName about photoUrl skills age gender";
    const loggedInUser = req.user;
    const requests = await connectionRequest
      .find({ toUserId: loggedInUser._id, status: "interested" })
      .populate("fromUserId", SAFE_USER_FIELDS);
    if (requests.length === 0) {
      throw new Error("No Recieved Requests!!!");
    }
    const received = requests.map(({ _id, fromUserId }: any) => ({
      _id,
      fromUserId,
    }));
    res.json({
      message: "received requests",
      data: received,
    });
  } catch (err: any) {
    res.status(400).json({
      message: err.message,
    });
  }
});

userRouter.get("/user/connections", userAuth, async (req:any, res:any): Promise<void> => {
  try {
    const loggedInUser = req.user;
    const SAFE_USER_FIELDS =
      "_id firstName lastName about photoUrl skills age gender";
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
    const connectionUsers = connections.map((row: any) => {
      if (loggedInUser._id.toString() === row.toUserId._id.toString()) {
        return row.fromUserId;
      } else {
        return row.toUserId;
      }
    });
    res.json({
      message: "Connections",
      data: connectionUsers,
    });
  } catch (err:any) {
    res.status(400).json({
      message: err.message,
    });
  }
});

userRouter.get("/feed", userAuth, async (req: any, res: any): Promise<void> => {
  try {
    const loggedInUser = req.user;

    const page = Number(req.query.page) || 1;
    let limit = Number(req.query.limit) || 10;

    limit = limit > 50 ? 50 : limit;
    const skip = (page - 1) * limit;

    const SAFE_USER_FIELDS =
      "_id firstName lastName about photoUrl skills age gender";

    const connectionRequests = await connectionRequest
      .find({
        $or: [{ toUserId: loggedInUser._id }, { fromUserId: loggedInUser._id }],
      })
      .select("fromUserId toUserId");

    const hideUserFromFeed = new Set<string>();
    connectionRequests.forEach((req: any) => {
      hideUserFromFeed.add(req.toUserId.toString());
      hideUserFromFeed.add(req.fromUserId.toString());
    });
    const Users = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUserFromFeed) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    })
      .select(SAFE_USER_FIELDS)
      .skip(skip)
      .limit(limit);
    res.json({
      message: "new Users ",
      data: Users,
    });
  } catch (err:any) {
    res.status(400).json({
      message: err.message,
    });
  }
});

module.exports = userRouter;
export{};