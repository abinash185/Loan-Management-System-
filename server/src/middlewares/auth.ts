import type { RequestHandler } from "express";
import { ApiError } from "../utils/ApiError";
import { verifyToken } from "../utils/jwt";
import { User } from "../models/User";

export const authenticate: RequestHandler = async (req, _res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw ApiError.unauthorized("Missing or malformed Authorization header");
    }

    let payload;
    try {
      payload = verifyToken(header.slice(7));
    } catch {
      throw ApiError.unauthorized("Invalid or expired token");
    }

    const user = await User.findById(payload.id).select("role");
    if (!user) throw ApiError.unauthorized("User no longer exists");

    req.user = { id: user.id, role: user.role };
    next();
  } catch (err) {
    next(err);
  }
};