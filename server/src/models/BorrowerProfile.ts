import { Schema, model, type InferSchemaType } from "mongoose";
import { EMPLOYMENT_MODE } from "../types";

const borrowerProfileSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    fullName: { type: String, required: true, trim: true },
    pan: { type: String, required: true, uppercase: true, trim: true },
    dob: { type: Date, required: true },
    monthlySalary: { type: Number, required: true, min: 0 },
    employmentMode: { type: String, enum: Object.values(EMPLOYMENT_MODE), required: true },
    salarySlip: {
      path: String,
      originalName: String,
      mimeType: String,
      size: Number,
    },
  },
  { timestamps: true }
);

export type IBorrowerProfile = InferSchemaType<typeof borrowerProfileSchema>;
export const BorrowerProfile = model("BorrowerProfile", borrowerProfileSchema);