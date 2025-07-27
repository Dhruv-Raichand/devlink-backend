const Express = require("express");
const requestRouter = Express.Router();
const { userAuth } = require("../middlewares/auth");
const User = require("../models/user");
const validator = require("validator");
const connectionRequest = require("../models/connection");


//Send Connection Request
requestRouter.post("/request/send/:status/:toUserId", userAuth, async (req, res) => {
  try {
    const { status, toUserId } = req.params;
    const user = req.user;
    const fromUserId = user._id;

    const allowed_status = ["interested", "ignored"];
    if (!allowed_status.includes(status)){
      throw new Error("Invalid Status Type " + status);
    }

    if (!validator.isMongoId(toUserId)) {
      throw new Error("Invalid userId");
    }

    if (fromUserId === toUserId) {
      throw new Error("sending request to yourself is not allowed")
    }

    const toUser = await User.findOne({ _id: toUserId });
    if (!toUser) {
      throw new Error("User not found");
    }

    const validateRequest = await connectionRequest.findOne({
      $or: [
        { fromUserId, toUserId},
        { fromUserId: toUserId, toUserId: fromUserId},
      ]
    })
    if(validateRequest) {
      throw new Error("request already exist")
    }
    
    const request = new connectionRequest({
      toUserId,
      fromUserId,
      status
    });
    const Data = await request.save();
    res.json({
      message: user.firstName + " " + status + " " + toUser.firstName,
      Data
    });
  } catch (err) {
    res.status(400).json({
      message: err.message
    });
  }
});

module.exports = requestRouter;
