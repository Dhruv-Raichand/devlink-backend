import crypto from 'crypto';

export const generateToken = (): string =>
  crypto.randomBytes(32).toString('hex');
