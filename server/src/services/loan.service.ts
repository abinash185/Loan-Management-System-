import { Loan } from "../models/Loan";
import { ApiError } from "../utils/ApiError";
import type { LoanStatus } from "../types";


export const LOAN_LIMITS = {
  MIN_AMOUNT: 50000,
  MAX_AMOUNT: 500000,
  MIN_TENURE: 30,
  MAX_TENURE: 365,
  INTEREST_RATE: 12, // % per annum, fixed
} as const;

const round2 = (n: number) => Math.round(n * 100) / 100;

export function calculateLoan(amount: number, tenureDays: number) {
  const rate = LOAN_LIMITS.INTEREST_RATE;
  // SI = (P × R × T) / (365 × 100)
  const simpleInterest = round2((amount * rate * tenureDays) / (365 * 100));
  const totalRepayment = round2(amount + simpleInterest);
  return { interestRate: rate, simpleInterest, totalRepayment };
}

export const toPaise = (rupees: number) => Math.round(rupees * 100);
export const fromPaise = (paise: number) => paise / 100;

// Dashboard lists mein borrower/profile ka data (salary slip ka disk path leak nahi hota)
export const loanPopulate = [
  { path: "borrower", select: "name email" },
  {
    path: "profile",
    select:
      "fullName pan dob monthlySalary employmentMode salarySlip.originalName salarySlip.mimeType salarySlip.size",
  },
];

/** Loan ko `from` status se naye status par le jao. Race condition par 409. */
export async function transitionLoan(
  id: string,
  from: LoanStatus,
  update: Record<string, unknown>
) {
  const loan = await Loan.findOneAndUpdate(
    { _id: id, status: from },
    { $set: update },
    { new: true }
  ).populate(loanPopulate);

  if (loan) return loan;

  if (!(await Loan.exists({ _id: id }))) throw ApiError.notFound("Loan not found");
  throw ApiError.conflict(`Loan is not in ${from} status`);
}