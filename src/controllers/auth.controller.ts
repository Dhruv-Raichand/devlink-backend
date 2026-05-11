import User from '../models/user.js';
import bcrypt from 'bcrypt';
import { validate } from '../utils/validate.js';
import sanitizeUser from '../utils/helper.js';
import { generateToken } from '../utils/token.js';
import { verificationEmail } from '../utils/emailTemplates.js';
import sendEmail from '../utils/sendEmail.js';

export const signup = async (req: any, res: any): Promise<void> => {
  const { firstName, lastName, emailId, password } = req.body;
  try {
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

    sendEmail({
      to: user.emailId,
      subject: 'Verify your DevLink email',
      html: verificationEmail(
        user.firstName,
        `${process.env.FRONTEND_URL}/verify-email?token=${verifyToken}`
      ),
    }).catch((err) => console.error('Verification email failed:', err));

    const Token = await signedUser.getJWT();

    res.cookie('token', Token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message: 'Account created. Check your email for verification.',
      data: sanitizeUser(signedUser),
    });
  } catch (err: any) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'This Email is already registered',
      });
    }
    res.status(400).json({
      success: false,
      message: 'Error in saving the user',
      errMessage: err.message,
    });
  }
};

export const login = async (req: any, res: any): Promise<void> => {
  const { emailId, password } = req.body;
  try {
    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new Error('Invalid Credentials');
    }
    const isCorrect = await user.comparePasswords(password);
    if (isCorrect) {
      const Token = await user.getJWT();
      res.cookie('token', Token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.json({
        success: true,
        message: 'Login Successful',
        data: sanitizeUser(user),
      });
    } else {
      throw new Error('Invalid Credentials');
    }
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const logout = (req: any, res: any): void => {
  res.cookie('token', null, { expires: new Date(Date.now()) });
  res.json({
    success: true,
    message: 'Logout successful',
  });
};

export const verifyEmail = async (req: any, res: any): Promise<void> => {
  try {
    const { token } = req.query;

    const user = await User.findOne({
      emailVerifyToken: token,
      emailVerifyExpiry: { $gt: new Date() },
    });

    if (!user) {
      res.status(400).json({
        success: false,
        message: 'Invalid or expired verification link',
      });
      return;
    }

    await User.findByIdAndUpdate(user._id, {
      $set: { emailVerified: true },
      $unset: { emailVerifyToken: '', emailVerifyExpiry: '' },
    });

    res.json({ success: true, message: 'Email verified' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const resendVerification = async (req: any, res: any): Promise<void> => {
  try {
    const user = req.user;
    if (user.emailVerified) {
      res.status(400).json({ success: false, message: 'Already verified' });
      return;
    }

    const verifyToken = generateToken();

    await User.findByIdAndUpdate(user._id, {
      $set: {
        emailVerifyToken: verifyToken,
        emailVerifyExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    sendEmail({
      to: user.emailId,
      subject: 'Verify your DevLink email',
      html: verificationEmail(
        user.firstName,
        `${process.env.FRONTEND_URL}/verify-email?token=${verifyToken}`
      ),
    }).catch((err) => console.error('Resend failed:', err));

    res.json({ success: true, message: 'Verification email sent' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
