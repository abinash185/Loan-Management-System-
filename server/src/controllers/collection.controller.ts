import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { parseId } from "../utils/objectId";
import { Loan } from "../models/Loan";
import { Payment } from "../models/Payment";
import { LOAN_STATUS } from "../types";
import { fromPaise, loanPopulate, toPaise } from "../services/loan.service";
import { paymentSchema } from "../validators/payment.validator";

const listQuery = z.object({
  status: z.enum([LOAN_STATUS.DISBURSED, LOAN_STATUS.CLOSED]).default(LOAN_STATUS.DISBURSED),
});

export const listLoans = asyncHandler(async (req, res) => {
  const { status } = listQuery.parse(req.query);
  const loans = await Loan.find({ status }).sort({ updatedAt: -1 }).populate(loanPopulate);
  res.json({ success: true, data: { count: loans.length, loans } });
});

export const getLoan = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const loan = await Loan.findById(id).populate(loanPopulate);
  if (!loan) throw ApiError.notFound("Loan not found");
  const payments = await Payment.find({ loan: id }).sort({ paidAt: -1 });
  res.json({ success: true, data: { loan, payments } });
});

export const recordPayment = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const { utr, amount, paidAt } = paymentSchema.parse(req.body);

  const loan = await Loan.findById(id);
  if (!loan) throw ApiError.notFound("Loan not found");
  if (loan.status !== LOAN_STATUS.DISBURSED) {
    throw ApiError.conflict(`Payments can only be recorded for DISBURSED loans (current: ${loan.status})`);
  }

  // Date checks
  if (paidAt.getTime() > Date.now()) throw ApiError.badRequest("Payment date cannot be in the future");
  if (loan.disbursedAt) {
    const disbursedDay = new Date(loan.disbursedAt.toISOString().slice(0, 10));
    if (paidAt < disbursedDay) {
      throw ApiError.badRequest("Payment date cannot be before the disbursement date");
    }
  }

  // Amount check (paise mein)
  const totalPaise = toPaise(loan.totalRepayment);
  const paidPaise = toPaise(loan.totalPaid);
  const outstandingPaise = totalPaise - paidPaise;
  const amountPaise = toPaise(amount);
  if (amountPaise > outstandingPaise) {
    throw ApiError.badRequest(`Amount exceeds outstanding balance (₹${fromPaise(outstandingPaise)})`);
  }

  // UTR unique
  if (await Payment.exists({ utr })) throw ApiError.conflict("This UTR number is already recorded");

  const payment = await Payment.create({
    loan: loan._id,
    utr,
    amount: fromPaise(amountPaise),
    paidAt,
    recordedBy: req.user!.id,
  });

  const newPaidPaise = paidPaise + amountPaise;
  const closes = newPaidPaise === totalPaise;

  // totalPaid wahi hona chahiye jo humne padha tha, warna koi aur payment beech mein aa gayi
  const updated = await Loan.findOneAndUpdate(
    { _id: loan._id, status: LOAN_STATUS.DISBURSED, totalPaid: loan.totalPaid },
    {
      $set: {
        totalPaid: fromPaise(newPaidPaise),
        ...(closes ? { status: LOAN_STATUS.CLOSED, closedAt: new Date() } : {}),
      },
    },
    { new: true }
  );

  if (!updated) {
    await Payment.deleteOne({ _id: payment._id });
    throw ApiError.conflict("Loan was updated by another request, please retry");
  }

  res.status(201).json({
    success: true,
    message: closes ? "Payment recorded. Loan fully repaid and closed" : "Payment recorded",
    data: { payment, loan: updated },
  });
});