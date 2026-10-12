import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler";
import { parseId } from "../utils/objectId";
import { Loan } from "../models/Loan";
import { LOAN_STATUS } from "../types";
import { loanPopulate, transitionLoan } from "../services/loan.service";

const listQuery = z.object({
  status: z.enum([LOAN_STATUS.SANCTIONED, LOAN_STATUS.DISBURSED]).default(LOAN_STATUS.SANCTIONED),
});

export const listLoans = asyncHandler(async (req, res) => {
  const { status } = listQuery.parse(req.query);
  const loans = await Loan.find({ status }).sort({ updatedAt: -1 }).populate(loanPopulate);
  res.json({ success: true, data: { count: loans.length, loans } });
});

export const disburseLoan = asyncHandler(async (req, res) => {
  const loan = await transitionLoan(parseId(req.params.id), LOAN_STATUS.SANCTIONED, {
    status: LOAN_STATUS.DISBURSED,
    disbursedBy: req.user!.id,
    disbursedAt: new Date(),
  });
  res.json({ success: true, message: "Loan disbursed", data: { loan } });
});