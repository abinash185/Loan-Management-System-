import type { RequestHandler } from "express";
import { ApiError } from "../utils/ApiError";
import { ROLES, type Role } from "../types";

/**
 * Admin hamesha allowed hai. Baaki roles explicitly pass karne hain.
 * Usage: router.use(authenticate, authorize(ROLES.SANCTION))
 */
export const authorize =
  (...allowed: Role[]): RequestHandler =>
  (req, _res, next) => {
    const role = req.user?.role;
    if (!role) return next(ApiError.unauthorized());
    if (role === ROLES.ADMIN || allowed.includes(role)) return next();
    next(ApiError.forbidden("You do not have access to this resource"));
  };


  /** Admin bypass NAHI hai. Sirf listed roles allowed. */
export const authorizeOnly =
  (...allowed: Role[]): RequestHandler =>
  (req, _res, next) => {
    const role = req.user?.role;
    if (!role) return next(ApiError.unauthorized());
    if (allowed.includes(role)) return next();
    next(ApiError.forbidden("You do not have access to this resource"));
  };