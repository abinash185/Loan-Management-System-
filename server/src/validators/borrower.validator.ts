import { z } from "zod";
import { EMPLOYMENT_MODE } from "../types";
import { LOAN_LIMITS } from "../services/loan.service";

export const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required"),
  pan: z.string().trim().toUpperCase().min(1, "PAN is required"),
  dob: z.coerce.date(),
  monthlySalary: z.coerce.number().min(0, "Salary cannot be negative"),
  employmentMode: z.enum([
    EMPLOYMENT_MODE.SALARIED,
    EMPLOYMENT_MODE.SELF_EMPLOYED,
    EMPLOYMENT_MODE.UNEMPLOYED,
  ]),
});

export const loanApplySchema = z.object({
  amount: z.coerce.number().int().min(LOAN_LIMITS.MIN_AMOUNT).max(LOAN_LIMITS.MAX_AMOUNT),
  tenureDays: z.coerce.number().int().min(LOAN_LIMITS.MIN_TENURE).max(LOAN_LIMITS.MAX_TENURE),
});