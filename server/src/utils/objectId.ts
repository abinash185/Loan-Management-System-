import { isValidObjectId } from "mongoose";
import { ApiError } from "./ApiError";

export function parseId(value: unknown): string {
  if (typeof value !== "string" || !isValidObjectId(value)) {
    throw ApiError.badRequest("Invalid id");
  }
  return value;
}