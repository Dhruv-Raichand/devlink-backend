import ConnectionModel from '../models/connection.js';
import User from '../models/user.js';

export const getReceivedRequests = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const SAFE_USER_FIELDS =
      '_id firstName lastName about photoUrl skills age gender';

    const loggedInUser = req.user;

    const requests = await ConnectionModel.find({
      toUserId: loggedInUser._id,
      status: 'interested',
    }).populate('fromUserId', SAFE_USER_FIELDS);

    const received = requests.map(({ _id, fromUserId }: any) => ({
      _id,
      fromUserId,
    }));

    res.json({
      success: true,
      message:
        received.length === 0
          ? 'No received requests yet'
          : 'Received requests fetched successfully',
      data: received,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const getConnections = async (req: any, res: any): Promise<void> => {
  try {
    const loggedInUser = req.user;

    const SAFE_USER_FIELDS =
      '_id firstName lastName about photoUrl skills age gender';

    const connections = await ConnectionModel.find({
      $or: [
        { toUserId: loggedInUser._id, status: 'accepted' },
        { fromUserId: loggedInUser._id, status: 'accepted' },
      ],
    })
      .populate('fromUserId', SAFE_USER_FIELDS)
      .populate('toUserId', SAFE_USER_FIELDS);

    const connectionUsers = connections.map(
      (row: { fromUserId: any; toUserId: any }) => {
        if (loggedInUser._id.toString() === row.toUserId._id.toString()) {
          return row.fromUserId;
        } else {
          return row.toUserId;
        }
      }
    );

    res.json({
      success: true,
      message:
        connections.length === 0
          ? 'No connections yet'
          : 'Connections fetched successfully',
      data: connectionUsers,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const getFeed = async (req: any, res: any): Promise<void> => {
  try {
    const loggedInUser = req.user;

    const page = Number(req.query.page) || 1;
    let limit = Number(req.query.limit) || 10;

    limit = limit > 50 ? 50 : limit;
    const skip = (page - 1) * limit;

    const SAFE_USER_FIELDS =
      '_id firstName lastName about photoUrl skills age gender';

    const ConnectionModels = await ConnectionModel.find({
      $or: [{ toUserId: loggedInUser._id }, { fromUserId: loggedInUser._id }],
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
      ],
    };

    const [users, totalCount] = await Promise.all([
      User.find(query).select(SAFE_USER_FIELDS).skip(skip).limit(limit),
      User.countDocuments(query),
    ]);

    res.json({
      success: true,
      message: users.length === 0 ? 'No new users found' : 'New users fetched',
      pagination: {
        totalUsers: totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        limit,
      },
      data: users,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
