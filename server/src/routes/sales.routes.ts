import { Router } from "express";
import { authenticate } from "../middlewares/auth";
import { authorize } from "../middlewares/rbac";
import { ROLES } from "../types";
import { listLeads } from "../controllers/sales.controller";

const router = Router();
router.use(authenticate, authorize(ROLES.SALES));

router.get("/leads", listLeads);

export default router;