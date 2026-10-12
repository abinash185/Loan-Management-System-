import { Router } from "express";
import { authenticate } from "../middlewares/auth";
import { authorize } from "../middlewares/rbac";
import { ROLES } from "../types";
import {
  approveLoan,
  downloadSalarySlip,
  listLoans,
  rejectLoan,
} from "../controllers/sanction.controller";

const router = Router();
router.use(authenticate, authorize(ROLES.SANCTION));

router.get("/loans", listLoans);
router.patch("/loans/:id/approve", approveLoan);
router.patch("/loans/:id/reject", rejectLoan);
router.get("/loans/:id/salary-slip", downloadSalarySlip);

export default router;