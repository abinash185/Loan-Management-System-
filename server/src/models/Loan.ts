import { Schema, model, type InferSchemaType } from "mongoose";
import { LOAN_STATUS } from "../types";

const loanSchema = new Schema(
  {
    borrower: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    profile: { type: Schema.Types.ObjectId, ref: "BorrowerProfile", required: true },

    // loan config
    amount: { type: Number, required: true, min: 50000, max: 500000 },
    tenureDays: { type: Number, required: true, min: 30, max: 365 },
    interestRate: { type: Number, required: true, default: 12 }, // % p.a.
    simpleInterest: { type: Number, required: true },
    totalRepayment: { type: Number, required: true },

    status: {
      type: String,
      enum: Object.values(LOAN_STATUS),
      default: LOAN_STATUS.APPLIED,
      index: true,
    },

    // sanction stage
    sanctionedBy: { type: Schema.Types.ObjectId, ref: "User" },
    sanctionedAt: Date,
    rejectionReason: String,

    // disbursement stage
    disbursedBy: { type: Schema.Types.ObjectId, ref: "User" },
    disbursedAt: Date,

    // collection stage
    totalPaid: { type: Number, default: 0, min: 0 },
    closedAt: Date,
  },
  { timestamps: true }
);

loanSchema.virtual("outstanding").get(function () {
  return Math.round((this.totalRepayment - this.totalPaid) * 100) / 100;
});
loanSchema.set("toJSON", { virtuals: true });
loanSchema.set("toObject", { virtuals: true });

export type ILoan = InferSchemaType<typeof loanSchema>;
export const Loan = model("Loan", loanSchema);