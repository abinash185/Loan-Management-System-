import { z } from "zod";

export const paymentSchema = z.object({
  utr: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9]{6,30}$/, "UTR must be 6-30 alphanumeric characters"),
  amount: z.coerce
    .number()
    .positive("Amount must be greater than 0")
    .refine((n) => Math.abs(n * 100 - Math.round(n * 100)) < 1e-6, "Max 2 decimal places allowed"),
  paidAt: z.coerce.date(),
});