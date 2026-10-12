export const LOAN_LIMITS = {
  MIN_AMOUNT: 50000,
  MAX_AMOUNT: 500000,
  AMOUNT_STEP: 5000,
  MIN_TENURE: 30,
  MAX_TENURE: 365,
  INTEREST_RATE: 12,
} as const;

const round2 = (n: number) => Math.round(n * 100) / 100;

// Sirf preview ke liye. Server khud dobara calculate karta hai.
export function calculateLoan(amount: number, tenureDays: number) {
  const simpleInterest = round2((amount * LOAN_LIMITS.INTEREST_RATE * tenureDays) / (365 * 100));
  return { simpleInterest, totalRepayment: round2(amount + simpleInterest) };
}