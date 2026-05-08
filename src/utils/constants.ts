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
