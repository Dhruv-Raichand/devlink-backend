const Express = require("express");
const requestRouter = Express.Router();
const { userAuth } = require("../middlewares/auth");
const User = require("../models/user");
const validator = require("validator");
const connectionRequest = require("../models/connection");

// const sendEmail = require("../utils/sendEmail");

//Send Connection Request
requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const { status, toUserId } = req.params;
      const user = req.user;
      const fromUserId = user._id;

      const allowed_status = ["interested", "ignored"];
      if (!allowed_status.includes(status)) {
        throw new Error("Invalid Status Type " + status);
      }

      if (!validator.isMongoId(toUserId)) {
        throw new Error("Invalid userId");
      }

      if (fromUserId === toUserId) {
        throw new Error("sending request to yourself is not allowed");
      }

      const toUser = await User.findOne({ _id: toUserId });
      if (!toUser) {
        throw new Error("User not found");
      }

      const validateRequest = await connectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });
      if (validateRequest) {
        throw new Error("request already exist");
      }

      const request = new connectionRequest({
        toUserId,
        fromUserId,
        status,
      });

      const Data = await request.save();

      // if (status === "interested") {
      //   const emailRes = await sendEmail.run(
      //     "Connection Request Sent Successfully",
      //     `Dear ${user?.firstName}, Your Connection Request is Successfully sent to ${toUser?.firstName} ${toUser?.lastName}`
      //   );
      //   console.log(emailRes);
      // }

      res.json({
        message: user.firstName + " " + status + " " + toUser.firstName,
        Data,
      });
    } catch (err) {
      res.status(400).json({
        message: err.message,
      });
    }
  }
);

//accept or reject recieved request
requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const { status, requestId } = req.params;
      const toUserId = req.user._id;
      const allowedStatuses = ["accepted", "rejected"];
      if (!allowedStatuses.includes(status)) {
        throw new Error("Invalid Request " + status);
      }
      if (!validator.isMongoId(requestId)) {
        throw new Error("Invalid requestId");
      }
      const request = await connectionRequest.findOne({
        _id: requestId,
        toUserId,
        status: "interested",
      });
      if (!request) {
        throw new Error("No request found");
      }
      request.status = status;
      const data = await request.save();
      res.json({
        message: "Connection request " + status,
        data: data,
      });
    } catch (err) {
      res.status(400).json({
        message: err.message,
      });
    }
  }
);

module.exports = requestRouter;
