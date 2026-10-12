import multer from "multer";
import path from "node:path";
import crypto from "node:crypto";
import { ApiError } from "../utils/ApiError";

// src/middlewares ya dist/middlewares, dono se ../../uploads = server/uploads
export const UPLOAD_DIR = path.resolve(__dirname, "../../uploads");

const ALLOWED_MIME = ["application/pdf", "image/jpeg", "image/png"];
const ALLOWED_EXT = [".pdf", ".jpg", ".jpeg", ".png"];

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (_req, file, cb) => {
    // user ka original naam disk par use nahi karte (path traversal / collision se bachne ke liye)
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

export const uploadSalarySlip = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_MIME.includes(file.mimetype) || !ALLOWED_EXT.includes(ext)) {
      return cb(ApiError.badRequest("Only PDF, JPG or PNG files are allowed"));
    }
    cb(null, true);
  },
}).single("salarySlip");