export const membershipPlans = {
  FREE: {
    MONTHLY: 0,
    YEARLY: 0,
  },
  PRO: {
    MONTHLY: 499,
    YEARLY: 3999,
  },
  ELITE: {
    MONTHLY: 999,
    YEARLY: 7999,
  },
} as const;

export type MembershipType = keyof typeof membershipPlans;
export type BillingCycle = 'MONTHLY' | 'YEARLY';

export const ACCESS_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict' as const,
  path: '/',
  maxAge: 15 * 60 * 1000,
};

export const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict' as const,
  path: 'api/auth',
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

export const SAFE_USER_FIELDS = [
  '_id',
  'firstName',
  'lastName',
  'about',
  'photoUrl',
  'skills',
  'age',
  'gender',
  'membershipType',
];

export const REQUEST_USER_FIELDS = [
  '_id',
  'firstName',
  'lastName',
  'age',
  'gender',
  'photoUrl',
  'about',
  'membershipType',
];

export const PROFILE_USER_FIELDS = [...SAFE_USER_FIELDS, 'githubUsername'];
