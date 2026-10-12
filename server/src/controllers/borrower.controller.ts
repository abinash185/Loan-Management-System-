import fs from "node:fs/promises";
import path from "node:path";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { BorrowerProfile } from "../models/BorrowerProfile";
import { Loan } from "../models/Loan";
import { LOAN_STATUS } from "../types";
import { runBre } from "../services/bre.service";
import { calculateLoan } from "../services/loan.service";
import { loanApplySchema, profileSchema } from "../validators/borrower.validator";
import { UPLOAD_DIR } from "../middlewares/upload";

// Step 2: personal details + BRE
export const saveProfile = asyncHandler(async (req, res) => {
  const input = profileSchema.parse(req.body);

  const bre = runBre(input);
  if (!bre.eligible) {
    throw new ApiError(422, "Application rejected: eligibility criteria not met", bre.failures);
  }

  const profile = await BorrowerProfile.findOneAndUpdate(
    { user: req.user!.id },
    { ...input, user: req.user!.id },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  res.json({ success: true, message: "Eligibility check passed", data: { profile } });
});

export const getProfile = asyncHandler(async (req, res) => {
  const profile = await BorrowerProfile.findOne({ user: req.user!.id });
  res.json({ success: true, data: { profile } });
});

// Step 3: salary slip
export const uploadSlip = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest("Salary slip file is required");

  const profile = await BorrowerProfile.findOne({ user: req.user!.id });
  if (!profile) {
    await fs.unlink(req.file.path).catch(() => {});
    throw ApiError.badRequest("Complete your personal details first");
  }

  // purani file ho to delete kar do
  if (profile.salarySlip?.path) {
    await fs.unlink(path.join(UPLOAD_DIR, profile.salarySlip.path)).catch(() => {});
  }

  profile.set("salarySlip", {
    path: req.file.filename, // sirf filename, UPLOAD_DIR ke relative
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size,
  });
  await profile.save();

  res.json({ success: true, message: "Salary slip uploaded", data: { salarySlip: profile.salarySlip } });
});

// Step 4: apply
export const applyForLoan = asyncHandler(async (req, res) => {
  const { amount, tenureDays } = loanApplySchema.parse(req.body);
  const userId = req.user!.id;

  const profile = await BorrowerProfile.findOne({ user: userId });
  if (!profile) throw ApiError.badRequest("Complete your personal details first");
  if (!profile.salarySlip?.path) throw ApiError.badRequest("Upload your salary slip first");

  // BRE dobara: profile save hone ke baad age/rules badal sakte hain
  const bre = runBre({
    pan: profile.pan,
    dob: profile.dob,
    monthlySalary: profile.monthlySalary,
    employmentMode: profile.employmentMode,
  });
  if (!bre.eligible) {
    throw new ApiError(422, "Application rejected: eligibility criteria not met", bre.failures);
  }

  const active = await Loan.exists({
    borrower: userId,
    status: { $in: [LOAN_STATUS.APPLIED, LOAN_STATUS.SANCTIONED, LOAN_STATUS.DISBURSED] },
  });
  if (active) throw ApiError.conflict("You already have an active loan");

  const loan = await Loan.create({
    borrower: userId,
    profile: profile._id,
    amount,
    tenureDays,
    ...calculateLoan(amount, tenureDays),
  });

  res.status(201).json({ success: true, message: "Loan application submitted", data: { loan } });
});

export const myLoans = asyncHandler(async (req, res) => {
  const loans = await Loan.find({ borrower: req.user!.id }).sort({ createdAt: -1 });
  res.json({ success: true, data: { loans } });
});