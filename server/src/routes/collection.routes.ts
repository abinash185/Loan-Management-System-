import { Router } from "express";
import { authenticate } from "../middlewares/auth";
import { authorize } from "../middlewares/rbac";
import { ROLES } from "../types";
import { getLoan, listLoans, recordPayment } from "../controllers/collection.controller";

const router = Router();
router.use(authenticate, authorize(ROLES.COLLECTION));

router.get("/loans", listLoans);
router.get("/loans/:id", getLoan);
router.post("/loans/:id/payments", recordPayment);

export default router;