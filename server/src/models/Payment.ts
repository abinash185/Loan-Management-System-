import { Schema, model, type InferSchemaType } from "mongoose";

const paymentSchema = new Schema(
  {
    loan: { type: Schema.Types.ObjectId, ref: "Loan", required: true, index: true },
    utr: { type: String, required: true, unique: true, uppercase: true, trim: true },
    amount: { type: Number, required: true, min: 0.01 },
    paidAt: { type: Date, required: true },
    recordedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export type IPayment = InferSchemaType<typeof paymentSchema>;
export const Payment = model("Payment", paymentSchema);