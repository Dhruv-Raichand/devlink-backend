import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import type { StringValue } from 'ms';

export const generateToken = (): string =>
  crypto.randomBytes(32).toString('hex');

export const generateAccessToken = (userId: string) => {
  const secret = process.env.ACCESS_TOKEN_SECRET_KEY;
  const expiry = process.env.ACCESS_TOKEN_EXPIRY;

  if (!secret || !expiry) {
    throw new Error('Access token env vars missing');
  }

  return jwt.sign({ userId }, secret, { expiresIn: expiry as StringValue });
};

export const generateRefreshToken = (userId: string) => {
  const secret = process.env.REFRESH_TOKEN_SECRET_KEY;
  const expiry = process.env.REFRESH_TOKEN_EXPIRY;

  if (!secret || !expiry) {
    throw new Error('Refresh token env vars missing');
  }

  return jwt.sign({ userId }, secret, { expiresIn: expiry as StringValue });
};
