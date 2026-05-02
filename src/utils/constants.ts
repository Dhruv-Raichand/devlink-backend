export const membershipAmount = {
  FREE: 0,
  PRO: 499,
  ELITE: 999,
} as const;

export type MembershipType = keyof typeof membershipAmount;
