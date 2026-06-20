import User from '../models/user.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { validate } from '../utils/validate.js';
import { assignVerificationToken, sanitizeUser } from '../utils/helper.js';
import {
  generateRefreshToken,
  generateAccessToken,
  hashToken,
} from '../utils/token.js';
import { SignupRequest, LoginRequest } from '../types/auth.types.js';
import { Request, Response } from 'express';
import {
  ACCESS_COOKIE_OPTIONS,
  REFRESH_COOKIE_OPTIONS,
} from '../utils/constants.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import { SendResponse } from '../utils/sendResponse.js';
import {
  addVerificationEmailJob,
  addWelcomeEmailJob,
} from '../queues/email.queue.js';

export const signup = asyncHandler(
  async (req: SignupRequest, res: Response): Promise<void> => {
    const { firstName, lastName, emailId, password } = req.body;
    validate(req.body);

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      emailId,
      password: hashedPassword,
    });

    const verifyToken = assignVerificationToken(user);

    const signedUser = await user.save();

    await addVerificationEmailJob(emailId, firstName, verifyToken);

    req.log.info({ userId: signedUser._id, emailId }, 'User registered');

    SendResponse(
      res,
      201,
      'Account created. Check your email for verification.',
      sanitizeUser(signedUser)
    );
  }
);

export const login = asyncHandler(
  async (req: LoginRequest, res: Response): Promise<void> => {
    const { emailId, password } = req.body;
    const user = await User.findOne({ emailId });
    if (!user) {
      req.log.warn({ emailId, reason: 'user_not_found' }, 'Login failed');
      throw new ApiError(400, 'Invalid Credentials');
    }

    if (!user.emailVerified) {
      req.log.warn({ userId: user._id }, 'Login blocked: email not verified');
      throw new ApiError(403, 'Please verify your email before logging in');
    }

    const isCorrect = await user.comparePasswords(password);
    if (!isCorrect) {
      req.log.warn({ emailId, reason: 'invalid_password' }, 'Login failed');
      throw new ApiError(400, 'Invalid Credentials');
    }

    const refreshToken = generateRefreshToken(user._id.toString());
    const accessToken = generateAccessToken(user._id.toString());

    user.refreshToken = hashToken(refreshToken);

    await user.save();

    res.cookie('accessToken', accessToken, ACCESS_COOKIE_OPTIONS);
    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

    req.log.info({ userId: user._id }, 'User logged in');

    SendResponse(res, 200, 'Login Successful', sanitizeUser(user));
  }
);

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    req.log.warn('Missing refresh token');
    throw new ApiError(401, 'Refresh token missing');
  }

  const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET_KEY as string;
  if (!refreshTokenSecret) {
    req.log.error('Refresh token secret not configured');
    throw new ApiError(500, 'Server configuration error');
  }

  let payload: { userId: string };

  try {
    payload = jwt.verify(refreshToken, refreshTokenSecret) as {
      userId: string;
    };
  } catch {
    req.log.warn('Refresh token verification failed');
    throw new ApiError(401, 'Invalid refresh token');
  }

  const user = await User.findById(payload.userId);

  if (!user || user.refreshToken !== hashToken(refreshToken)) {
    req.log.warn({ userId: payload.userId }, 'Refresh token mismatch');
    throw new ApiError(401, 'Invalid refresh token');
  }

  const accessToken = generateAccessToken(user._id.toString());
  const newRefreshToken = generateRefreshToken(user._id.toString());

  user.refreshToken = hashToken(newRefreshToken);
  await user.save();

  res.cookie('accessToken', accessToken, ACCESS_COOKIE_OPTIONS);
  res.cookie('refreshToken', newRefreshToken, REFRESH_COOKIE_OPTIONS);

  req.log.info({ userId: user._id }, 'Access token refreshed');

  SendResponse(res, 200, 'Token refreshed');
});

export const logout = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (req.user) {
      req.user.refreshToken = null;
      await req.user.save();
    }

    res.clearCookie('refreshToken', { path: REFRESH_COOKIE_OPTIONS.path });
    res.clearCookie('accessToken', { path: ACCESS_COOKIE_OPTIONS.path });

    req.log.info({ userId: req.user?._id }, 'User logged out');

    SendResponse(res, 200, 'Logout successful');
  }
);

export const verifyEmail = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { token } = req.query;

    if (typeof token !== 'string') {
      req.log.warn('Invalid email verification token format');
      throw new ApiError(400, 'Invalid verification link');
    }

    const user = await User.findOne({
      emailVerifyToken: hashToken(token),
      emailVerifyExpiry: { $gt: new Date() },
    });

    if (!user) {
      req.log.warn('Invalid email verification token');
      throw new ApiError(400, 'Invalid or expired verification link');
    }

    await User.findByIdAndUpdate(user._id, {
      $set: { emailVerified: true },
      $unset: { emailVerifyToken: '', emailVerifyExpiry: '' },
    });

    req.log.info({ userId: user._id }, 'Email verified');

    try {
      await addWelcomeEmailJob(user.emailId, user.firstName);
    } catch (err) {
      req.log.error({ userId: user._id, err }, 'Failed to queue welcome email');
    }

    SendResponse(res, 200, 'Email verified successfully');
  }
);

export const resendVerification = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { emailId } = req.body;

    const user = await User.findOne({ emailId });

    if (user && !user.emailVerified) {
      const verifyToken = assignVerificationToken(user);
      await user.save();

      await addVerificationEmailJob(emailId, user.firstName, verifyToken);

      req.log.info({ emailId }, 'Verification email resent');
    }

    SendResponse(
      res,
      200,
      'If an account exists, a verification email has been sent.'
    );
  }
);
