import { Schema, model, type InferSchemaType } from "mongoose";
import { ROLES } from "../types";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: Object.values(ROLES), default: ROLES.BORROWER, index: true },
  },
  { timestamps: true }
);

export type IUser = InferSchemaType<typeof userSchema>;
export const User = model("User", userSchema);