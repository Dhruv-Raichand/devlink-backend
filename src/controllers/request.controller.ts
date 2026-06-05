import User from '../models/user.js';
import validator from 'validator';
import ConnectionModel from '../models/connection.js';
import { io, onlineUsers } from '../utils/socket.js';
import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import { SendResponse } from '../utils/sendResponse.js';

export const sendRequest = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { status, toUserId } = req.params;

    const user = req.user;
    if (!user) {
      throw new ApiError(401, 'Unauthorized');
    }
    const fromUserId = user._id;

    const allowed_status = ['interested', 'ignored'];
    if (typeof status !== 'string' || !allowed_status.includes(status)) {
      throw new ApiError(400, `Invalid Status Type: ${status}`);
    }

    if (typeof toUserId !== 'string' || !validator.isMongoId(toUserId)) {
      throw new ApiError(400, 'Invalid userId');
    }

    if (fromUserId.toString() === toUserId) {
      throw new ApiError(400, 'sending request to yourself is not allowed');
    }

    const toUser = await User.findOne({ _id: toUserId });
    if (!toUser) {
      throw new ApiError(404, 'User not found');
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
      throw new ApiError(400, 'request already exist');
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
        throw new ApiError(400, 'request already exist');
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

    SendResponse(res, 200, `Sent ${status} request successfully`, Data);
  }
);

export const reviewRequest = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { status, requestId } = req.params;

    const user = req.user;
    if (!user) {
      throw new ApiError(401, 'Unauthorized');
    }
    const toUserId = user._id;

    const allowedStatuses = ['accepted', 'rejected'];
    if (typeof status !== 'string' || !allowedStatuses.includes(status)) {
      throw new ApiError(400, `Invalid Request Status: ${status}`);
    }

    if (typeof requestId !== 'string' || !validator.isMongoId(requestId)) {
      throw new ApiError(400, 'Invalid requestId');
    }

    const request = await ConnectionModel.findOne({
      _id: requestId,
      toUserId,
      status: 'interested',
    });

    if (!request) {
      throw new ApiError(404, 'Request not found or already reviewed');
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

    SendResponse(res, 200, `Request ${status} successfully`, data);
  }
);

export const withdrawRequest = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { requestId } = req.params;

    const user = req.user;
    if (!user) {
      throw new ApiError(401, 'Unauthorized');
    }
    const loggedInUser = user._id;

    if (typeof requestId !== 'string' || !validator.isMongoId(requestId)) {
      throw new ApiError(400, 'Invalid requestId');
    }

    const request = await ConnectionModel.findOneAndDelete({
      _id: requestId,
      fromUserId: loggedInUser,
      status: 'interested',
    });

    if (!request) {
      throw new ApiError(404, 'Request not found or already reviewed');
    }

    SendResponse(res, 200, 'Request withdrawn');
  }
);

export const removeConnection = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params;

    const user = req.user;
    if (!user) {
      throw new ApiError(401, 'Unauthorized');
    }

    const loggedInUser = user._id;

    if (typeof userId !== 'string' || !validator.isMongoId(userId)) {
      throw new ApiError(400, 'Invalid userId');
    }

    const connection = await ConnectionModel.findOneAndDelete({
      $or: [
        { fromUserId: loggedInUser, toUserId: userId, status: 'accepted' },
        { fromUserId: userId, toUserId: loggedInUser, status: 'accepted' },
      ],
    });

    if (!connection) {
      throw new ApiError(404, 'Connection not found');
    }

    SendResponse(res, 200, 'Connection removed');
  }
);
