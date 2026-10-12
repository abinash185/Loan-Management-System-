import { Router } from "express";
import { authenticate } from "../middlewares/auth";
import { authorizeOnly } from "../middlewares/rbac";
import { uploadSalarySlip } from "../middlewares/upload";
import { ROLES } from "../types";
import {
  applyForLoan,
  getProfile,
  myLoans,
  saveProfile,
  uploadSlip,
} from "../controllers/borrower.controller";

const router = Router();

router.use(authenticate, authorizeOnly(ROLES.BORROWER));

router.get("/profile", getProfile);
router.post("/profile", saveProfile);
router.post("/salary-slip", uploadSalarySlip, uploadSlip);
router.post("/loans", applyForLoan);
router.get("/loans", myLoans);

export default router;