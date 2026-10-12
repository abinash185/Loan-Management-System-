import { EMPLOYMENT_MODE } from "@/types";

export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

export interface BreHint {
  rule: "AGE" | "SALARY" | "PAN" | "EMPLOYMENT";
  message: string;
}

function ageFromDob(dob: string): number {
  const [y, m, d] = dob.split("-").map(Number);
  if (!y || !m || !d) return NaN;
  const now = new Date();
  let age = now.getFullYear() - y;
  if (now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d)) age--;
  return age;
}

export function checkEligibility(i: {
  pan: string;
  dob: string;
  monthlySalary: number;
  employmentMode: string;
}): BreHint[] {
  const hints: BreHint[] = [];
  const age = ageFromDob(i.dob);
  if (!Number.isNaN(age) && (age < 23 || age > 50)) {
    hints.push({ rule: "AGE", message: `Age must be between 23 and 50 (yours: ${age})` });
  }
  if (!Number.isNaN(i.monthlySalary) && i.monthlySalary < 25000) {
    hints.push({ rule: "SALARY", message: "Monthly salary must be at least ₹25,000" });
  }
  if (i.pan && !PAN_REGEX.test(i.pan)) {
    hints.push({ rule: "PAN", message: "PAN format should be like ABCDE1234F" });
  }
  if (i.employmentMode === EMPLOYMENT_MODE.UNEMPLOYED) {
    hints.push({ rule: "EMPLOYMENT", message: "Unemployed applicants are not eligible" });
  }
  return hints;
}