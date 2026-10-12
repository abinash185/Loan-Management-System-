import path from "node:path";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { parseId } from "../utils/objectId";
import { Loan } from "../models/Loan";
import { BorrowerProfile } from "../models/BorrowerProfile";
import { LOAN_STATUS } from "../types";
import { loanPopulate, transitionLoan } from "../services/loan.service";
import { UPLOAD_DIR } from "../middlewares/upload";

const listQuery = z.object({
  status: z
    .enum([LOAN_STATUS.APPLIED, LOAN_STATUS.SANCTIONED, LOAN_STATUS.REJECTED])
    .default(LOAN_STATUS.APPLIED),
});
const rejectSchema = z.object({
  reason: z.string().trim().min(5, "Reason must be at least 5 characters").max(500),
});

export const listLoans = asyncHandler(async (req, res) => {
  const { status } = listQuery.parse(req.query);
  const loans = await Loan.find({ status }).sort({ createdAt: -1 }).populate(loanPopulate);
  res.json({ success: true, data: { count: loans.length, loans } });
});

export const approveLoan = asyncHandler(async (req, res) => {
  const loan = await transitionLoan(parseId(req.params.id), LOAN_STATUS.APPLIED, {
    status: LOAN_STATUS.SANCTIONED,
    sanctionedBy: req.user!.id,
    sanctionedAt: new Date(),
  });
  res.json({ success: true, message: "Loan sanctioned", data: { loan } });
});

export const rejectLoan = asyncHandler(async (req, res) => {
  const { reason } = rejectSchema.parse(req.body);
  const loan = await transitionLoan(parseId(req.params.id), LOAN_STATUS.APPLIED, {
    status: LOAN_STATUS.REJECTED,
    rejectionReason: reason,
    sanctionedBy: req.user!.id,
    sanctionedAt: new Date(),
  });
  res.json({ success: true, message: "Loan rejected", data: { loan } });
});

export const downloadSalarySlip = asyncHandler(async (req, res) => {
  const loan = await Loan.findById(parseId(req.params.id));
  if (!loan) throw ApiError.notFound("Loan not found");

  const profile = await BorrowerProfile.findById(loan.profile);
  const slip = profile?.salarySlip;
  if (!slip?.path) throw ApiError.notFound("Salary slip not found");

  res.download(path.join(UPLOAD_DIR, slip.path), slip.originalName ?? "salary-slip");
});