import { Router } from "express";
import { authenticate } from "../middlewares/auth";
import { authorize } from "../middlewares/rbac";
import { ROLES } from "../types";
import { disburseLoan, listLoans } from "../controllers/disbursement.controller";

const router = Router();
router.use(authenticate, authorize(ROLES.DISBURSEMENT));

router.get("/loans", listLoans);
router.patch("/loans/:id/disburse", disburseLoan);

export default router;