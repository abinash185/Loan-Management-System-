import type { EmploymentMode } from "../types";
import { EMPLOYMENT_MODE } from "../types";

// 5 letters + 4 digits + 1 letter (jaise ABCDE1234F)
export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

export const BRE_RULES = {
  MIN_AGE: 23,
  MAX_AGE: 50,
  MIN_SALARY: 25000,
} as const;

export interface BreInput {
  pan: string;
  dob: Date;
  monthlySalary: number;
  employmentMode: EmploymentMode;
}

export interface BreFailure {
  rule: "AGE" | "SALARY" | "PAN" | "EMPLOYMENT";
  message: string;
}

export interface BreResult {
  eligible: boolean;
  failures: BreFailure[];
}

export function calculateAge(dob: Date, today: Date = new Date()): number {
  let age = today.getUTCFullYear() - dob.getUTCFullYear();
  const monthDiff = today.getUTCMonth() - dob.getUTCMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getUTCDate() < dob.getUTCDate())) {
    age--;
  }
  return age;
}

export function runBre(input: BreInput): BreResult {
  const failures: BreFailure[] = [];

  const age = calculateAge(input.dob);
  if (age < BRE_RULES.MIN_AGE || age > BRE_RULES.MAX_AGE) {
    failures.push({
      rule: "AGE",
      message: `Age must be between ${BRE_RULES.MIN_AGE} and ${BRE_RULES.MAX_AGE} years (your age: ${age})`,
    });
  }

  if (input.monthlySalary < BRE_RULES.MIN_SALARY) {
    failures.push({
      rule: "SALARY",
      message: `Monthly salary must be at least ₹${BRE_RULES.MIN_SALARY.toLocaleString("en-IN")}`,
    });
  }

  if (!PAN_REGEX.test(input.pan)) {
    failures.push({ rule: "PAN", message: "Invalid PAN format (expected format: ABCDE1234F)" });
  }

  if (input.employmentMode === EMPLOYMENT_MODE.UNEMPLOYED) {
    failures.push({ rule: "EMPLOYMENT", message: "Unemployed applicants are not eligible" });
  }

  return { eligible: failures.length === 0, failures };
}