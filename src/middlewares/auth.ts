const jwt = require('jsonwebtoken');
const User = require('../models/user');

const userAuth = async (req: any, res: any, next: Function) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication Required',
      });
    }

    const decodedMessage = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const { _id } = decodedMessage;

    const user = await User.findById(_id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token',
      });
    }

    req.user = user;
    next();
  } catch (err: any) {
    console.error('Auth error:', err.message);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

module.exports = {
  userAuth,
};
export {};
