import ConnectionModel from '../models/connection.js';
import User, { IUser } from '../models/user.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { SAFE_USER_FIELDS, REQUEST_USER_FIELDS } from '../utils/constants.js';
import { toSelectString } from '../utils/helper.js';
import { Request, Response } from 'express';
import { SendResponse } from '../utils/sendResponse.js';

export const getReceivedRequests = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const loggedInUser = req.user;

    if (!loggedInUser) {
      throw new ApiError(401, 'Unauthorized');
    }

    const requests = await ConnectionModel.find({
      toUserId: loggedInUser._id,
      status: 'interested',
    }).populate<{ fromUserId: IUser }>(
      'fromUserId',
      toSelectString(REQUEST_USER_FIELDS)
    );

    const received = requests.map(({ _id, fromUserId }: any) => ({
      _id,
      fromUserId,
    }));

    req.log.debug(
      { userId: loggedInUser._id, count: received.length },
      'Received requests fetched'
    );

    SendResponse(res, 200, 'Received requests fetched successfully', received);
  }
);

export const getConnections = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const loggedInUser = req.user;

    if (!loggedInUser) {
      throw new ApiError(401, 'Unauthorized');
    }

    const connections = await ConnectionModel.find({
      $or: [
        { toUserId: loggedInUser._id, status: 'accepted' },
        { fromUserId: loggedInUser._id, status: 'accepted' },
      ],
    })
      .populate<{ fromUserId: IUser }>(
        'fromUserId',
        toSelectString(SAFE_USER_FIELDS)
      )
      .populate<{ toUserId: IUser }>(
        'toUserId',
        toSelectString(SAFE_USER_FIELDS)
      );

    const connectionUsers = connections.map((row) => {
      return loggedInUser._id.toString() === row.toUserId._id.toString()
        ? row.fromUserId
        : row.toUserId;
    });

    req.log.debug(
      { userId: loggedInUser._id, count: connectionUsers.length },
      'Connections fetched'
    );

    SendResponse(res, 200, 'Connections fetched successfully', connectionUsers);
  }
);

export const getFeed = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const loggedInUser = req.user;

    if (!loggedInUser) {
      throw new ApiError(401, 'Unauthorized');
    }

    const page = Number(req.query.page) || 1;
    let limit = Number(req.query.limit) || 10;

    limit = limit > 50 ? 50 : limit;
    const skip = (page - 1) * limit;

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const skillFilter = req.query.skills
      ? { skills: { $in: (req.query.skills as string).split(',') } }
      : {};

    const ConnectionModels = await ConnectionModel.find({
      $and: [
        {
          $or: [
            { toUserId: loggedInUser._id },
            { fromUserId: loggedInUser._id },
          ],
        },
        {
          $or: [
            { status: { $in: ['interested', 'accepted', 'rejected'] } },
            { status: 'ignored', createdAt: { $gte: thirtyDaysAgo } },
          ],
        },
      ],
    }).select('fromUserId toUserId');

    const hideUserFromFeed = new Set<string>();
    ConnectionModels.forEach((req: any) => {
      hideUserFromFeed.add(req.toUserId.toString());
      hideUserFromFeed.add(req.fromUserId.toString());
    });

    const query = {
      $and: [
        { _id: { $nin: Array.from(hideUserFromFeed) } },
        { _id: { $ne: loggedInUser._id } },
        ...(Object.keys(skillFilter).length ? [skillFilter] : []),
      ],
    };

    const [users, totalCount] = await Promise.all([
      User.find(query).select(SAFE_USER_FIELDS).skip(skip).limit(limit),
      User.countDocuments(query),
    ]);

    req.log.debug(
      {
        userId: loggedInUser._id,
        page,
        limit,
        count: users.length,
        totalUsers: totalCount,
      },
      'Feed fetched'
    );

    SendResponse(res, 200, 'Feed fetched successfully', {
      items: users,
      pagination: {
        totalUsers: totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        limit,
      },
    });
  }
);

export const getSentRequests = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const loggedInUser = req.user;

    if (!loggedInUser) {
      throw new ApiError(401, 'Unauthorized');
    }

    const requests = await ConnectionModel.find({
      fromUserId: loggedInUser._id,
      status: 'interested',
    }).populate<{ toUserId: IUser }>(
      'toUserId',
      toSelectString(REQUEST_USER_FIELDS)
    );

    const sent = requests.map(({ _id, toUserId }) => ({
      _id,
      toUserId,
    }));

    req.log.debug(
      { userId: loggedInUser._id, count: sent.length },
      'Sent requests fetched'
    );

    SendResponse(res, 200, 'Sent requests fetched successfully', sent);
  }
);
