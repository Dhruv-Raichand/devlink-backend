import User from '../models/user.js';
import bcrypt from 'bcrypt';
import { validate } from '../utils/validate.js';
import { sanitizeUser } from '../utils/helper.js';
import { generateToken } from '../utils/token.js';
import { verificationEmail } from '../utils/emailTemplates.js';
import sendEmail from '../utils/sendEmail.js';
import { SignupRequest, LoginRequest } from '../types/auth.types.js';
import { Request, Response } from 'express';
import { COOKIE_OPTIONS } from '../utils/constants.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import { SendResponse } from '../utils/sendResponse.js';

export const signup = asyncHandler(
  async (req: SignupRequest, res: Response): Promise<void> => {
    const { firstName, lastName, emailId, password } = req.body;
    validate(req.body);

    const hashedPassword = await bcrypt.hash(password, 10);
    const verifyToken = generateToken();

    const user = new User({
      firstName,
      lastName,
      emailId,
      password: hashedPassword,
      emailVerifyToken: verifyToken,
      emailVerifyExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    const signedUser = await user.save();

    await sendEmail({
      to: user.emailId,
      subject: 'Verify your DevLink email',
      html: verificationEmail(
        user.firstName,
        `${process.env.FRONTEND_URL}/verify-email?token=${verifyToken}`
      ),
    });

    const Token = await signedUser.getJWT();

    res.cookie('token', Token, COOKIE_OPTIONS);

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
      throw new ApiError(400, 'Invalid Credentials');
    }

    const isCorrect = await user.comparePasswords(password);
    if (!isCorrect) {
      throw new ApiError(400, 'Invalid Credentials');
    }

    const Token = await user.getJWT();

    res.cookie('token', Token, COOKIE_OPTIONS);

    SendResponse(res, 200, 'Login Successful', sanitizeUser(user));
  }
);

export const logout = (req: Request, res: Response): void => {
  res.cookie('token', null, { expires: new Date(Date.now()) });

  SendResponse(res, 200, 'Logout successful');
};

export const verifyEmail = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { token } = req.query;

    if (typeof token !== 'string') {
      throw new ApiError(400, 'Invalid verification link');
    }

    const user = await User.findOne({
      emailVerifyToken: token,
      emailVerifyExpiry: { $gt: new Date() },
    });

    if (!user) {
      throw new ApiError(400, 'Invalid or expired verification link');
    }

    await User.findByIdAndUpdate(user._id, {
      $set: { emailVerified: true },
      $unset: { emailVerifyToken: '', emailVerifyExpiry: '' },
    });

    SendResponse(res, 200, 'Email verified successfully');
  }
);

export const resendVerification = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const user = req.user;

    if (!user) {
      throw new ApiError(401, 'Unauthorized');
    }

    if (user.emailVerified) {
      throw new ApiError(400, 'Email already verified');
    }

    const verifyToken = generateToken();

    await User.findByIdAndUpdate(user._id, {
      $set: {
        emailVerifyToken: verifyToken,
        emailVerifyExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    await sendEmail({
      to: user.emailId,
      subject: 'Verify your DevLink email',
      html: verificationEmail(
        user.firstName,
        `${process.env.FRONTEND_URL}/verify-email?token=${verifyToken}`
      ),
    });

    SendResponse(res, 200, 'Verification email sent');
  }
);
