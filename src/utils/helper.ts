import { generateToken, hashToken } from './token.js';
import { IUser, UserDocument } from '../models/user.js';

export const sanitizeUser = (user: UserDocument) => {
  const {
    password,
    refreshToken,
    emailVerifyToken,
    emailVerifyExpiry,
    ...safeUser
  } = user.toObject();

  return safeUser;
};

export const toSelectString = (fields: string[]) => fields.join(' ');

const verificationTokenExpiry = () =>
  new Date(Date.now() + 24 * 60 * 60 * 1000);

export const assignVerificationToken = (user: IUser) => {
  const token = generateToken();
  user.emailVerifyToken = hashToken(token);
  user.emailVerifyExpiry = verificationTokenExpiry();
  return token;
};
