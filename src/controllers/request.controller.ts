import User from '../models/user.js';
import validator from 'validator';
import ConnectionModel from '../models/connection.js';
import sendEmail from '../utils/sendEmail.js';

export const sendRequest = async (req: any, res: any): Promise<void> => {
  try {
    const { status, toUserId } = req.params;
    const user = req.user;
    const fromUserId = user._id;

    const allowed_status = ['interested', 'ignored'];
    if (!allowed_status.includes(status)) {
      throw new Error('Invalid Status Type ' + status);
    }

    if (!validator.isMongoId(toUserId)) {
      throw new Error('Invalid userId');
    }

    if (fromUserId.toString() === toUserId) {
      throw new Error('sending request to yourself is not allowed');
    }

    const toUser = await User.findOne({ _id: toUserId });
    if (!toUser) {
      throw new Error('User not found');
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const validateRequest = await ConnectionModel.findOne({
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId },
      ],

      $nor: [{ status: 'ignored', createdAt: { $lt: thirtyDaysAgo } }],
    });
    if (validateRequest) {
      throw new Error('request already exist');
    }

    const existingRequest = await ConnectionModel.findOne({
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId },
      ],
    });

    if (existingRequest) {
      const isExpiredIgnore =
        existingRequest.status === 'ignored' &&
        existingRequest.createdAt < thirtyDaysAgo;

      if (!isExpiredIgnore) {
        throw new Error('request already exist');
      }

      await ConnectionModel.deleteOne({ _id: existingRequest._id });
    }

    const request = new ConnectionModel({
      toUserId,
      fromUserId,
      status,
    });

    const Data = await request.save();

    if (status === 'interested') {
      sendEmail(
        'Connection Request Sent Successfully',
        `Dear ${user?.firstName}, Your Connection Request is Successfully sent to ${toUser?.firstName} ${toUser?.lastName}`
      ).catch((err) => {
        console.error('Email failed:', err);
      });
    }

    res.json({
      success: true,
      message: `${user.firstName} ${status} ${toUser.firstName}`,
      data: Data,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const reviewRequest = async (req: any, res: any): Promise<void> => {
  try {
    const { status, requestId } = req.params;
    const toUserId = req.user._id;
    const allowedStatuses = ['accepted', 'rejected'];
    if (!allowedStatuses.includes(status)) {
      throw new Error('Invalid Request ' + status);
    }
    if (!validator.isMongoId(requestId)) {
      throw new Error('Invalid requestId');
    }
    const request = await ConnectionModel.findOne({
      _id: requestId,
      toUserId,
      status: 'interested',
    });
    if (!request) {
      return res.json({
        success: true,
        message: 'No pending requests to review',
        data: [],
      });
    }

    request.status = status;
    const data = await request.save();
    res.json({
      success: true,
      message: `Connection request  ${status}`,
      data: data,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const withdrawRequest = async (req: any, res: any): Promise<void> => {
  try {
    const { requestId } = req.params;
    const loggedInUser = req.user._id;

    if (!validator.isMongoId(requestId)) {
      throw new Error('Invalid requestId');
    }

    const request = await ConnectionModel.findOneAndDelete({
      _id: requestId,
      fromUserId: loggedInUser,
      status: 'interested',
    });

    if (!request) {
      throw new Error('Request not found or already reviewed');
    }

    res.json({ success: true, message: 'Request withdrawn' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const removeConnection = async (req: any, res: any): Promise<void> => {
  try {
    const { userId } = req.params;
    const loggedInUser = req.user._id;

    if (!validator.isMongoId(userId)) {
      throw new Error('Invalid userId');
    }

    const connection = await ConnectionModel.findOneAndDelete({
      $or: [
        { fromUserId: loggedInUser, toUserId: userId, status: 'accepted' },
        { fromUserId: userId, toUserId: loggedInUser, status: 'accepted' },
      ],
    });

    if (!connection) {
      throw new Error('Connection not found');
    }

    res.json({ success: true, message: 'Connection removed' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};
