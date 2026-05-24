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

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: 'none' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
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
  'memberShipType',
];

export const REQUEST_USER_FIELDS = [
  '_id',
  'firstName',
  'lastName',
  'age',
  'gender',
  'photoUrl',
  'about',
  'memberShipType',
];

export const PROFILE_USER_FIELDS = [...SAFE_USER_FIELDS, 'githubUsername'];
