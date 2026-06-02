import User from '../models/user.js';
import validator from 'validator';
import ConnectionModel from '../models/connection.js';
import { io, onlineUsers } from '../utils/socket.js';
import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';

export const sendRequest = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { status, toUserId } = req.params;

    const user = req.user;
    if (!user) {
      res.status(400).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }
    const fromUserId = user._id;

    const allowed_status = ['interested', 'ignored'];
    if (typeof status !== 'string' || !allowed_status.includes(status)) {
      throw new Error('Invalid Status Type ' + status);
    }

    if (typeof toUserId !== 'string' || !validator.isMongoId(toUserId)) {
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
      const targetSocketId = onlineUsers.get(toUserId.toString());
      if (targetSocketId) {
        io.to(targetSocketId).emit('newNotification', {
          type: 'request',
          from: user.firstName,
          text: 'sent you a connection request',
          targetUserId: user._id.toString(),
        });
      }
    }

    res.json({
      success: true,
      message: `${user.firstName} ${status} ${toUser.firstName}`,
      data: Data,
    });
  }
);

export const reviewRequest = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { status, requestId } = req.params;

    const user = req.user;
    if (!user) {
      res.status(400).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }
    const toUserId = user._id;

    const allowedStatuses = ['accepted', 'rejected'];
    if (typeof status !== 'string' || !allowedStatuses.includes(status)) {
      throw new Error('Invalid Request ' + status);
    }

    if (typeof requestId !== 'string' || !validator.isMongoId(requestId)) {
      throw new Error('Invalid requestId');
    }

    const request = await ConnectionModel.findOne({
      _id: requestId,
      toUserId,
      status: 'interested',
    });

    if (!request) {
      res.json({
        success: true,
        message: 'No pending requests to review',
        data: [],
      });
      return;
    }

    if (status === 'accepted') {
      const targetSocketId = onlineUsers.get(request.fromUserId.toString());
      if (targetSocketId) {
        io.to(targetSocketId).emit('newNotification', {
          type: 'request_accepted',
          from: user.firstName,
          text: 'accepted your connection request',
          targetUserId: user._id.toString(),
        });
      }
      request.status = 'accepted';
    }

    if (status === 'rejected') {
      request.status = 'rejected';
    }

    const data = await request.save();
    res.json({
      success: true,
      message: `Connection request  ${status}`,
      data: data,
    });
  }
);

export const withdrawRequest = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { requestId } = req.params;

    const user = req.user;
    if (!user) {
      res.status(400).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }
    const loggedInUser = user._id;

    if (typeof requestId !== 'string' || !validator.isMongoId(requestId)) {
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
  }
);

export const removeConnection = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params;

    const user = req.user;
    if (!user) {
      res.status(400).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    const loggedInUser = user._id;

    if (typeof userId !== 'string' || !validator.isMongoId(userId)) {
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
  }
);
