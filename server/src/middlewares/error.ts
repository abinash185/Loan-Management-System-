import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";
import multer from "multer";
import { ApiError } from "../utils/ApiError";
import { env } from "../config/env";

export const notFound: RequestHandler = (req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({ success: false, message: err.message, details: err.details });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      details: err.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
    });
    return;
  }

  if (err instanceof multer.MulterError) {
    const message = err.code === "LIMIT_FILE_SIZE" ? "File too large (max 5 MB)" : err.message;
    res.status(400).json({ success: false, message });
    return;
  }

  // Mongo duplicate key (e.g. unique UTR, unique email)
  if (typeof err === "object" && err !== null && (err as { code?: number }).code === 11000) {
    const fields = Object.keys((err as { keyPattern?: object }).keyPattern ?? {}).join(", ");
    res.status(409).json({ success: false, message: `Duplicate value for: ${fields}` });
    return;
  }

  console.error(err);
  res.status(500).json({
    success: false,
    message: env.NODE_ENV === "production" ? "Internal server error" : String(err?.message ?? err),
  });
};