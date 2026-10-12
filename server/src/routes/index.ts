import { Router } from "express";
import authRoutes from "./auth.routes";
import borrowerRoutes from "./borrower.routes";
import salesRoutes from "./sales.routes";
import sanctionRoutes from "./sanction.routes";
import disbursementRoutes from "./disbursement.routes";
import collectionRoutes from "./collection.routes";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ success: true, message: "LMS API running" });
});

router.use("/auth", authRoutes);
router.use("/borrower", borrowerRoutes);
router.use("/sales", salesRoutes);
router.use("/sanction", sanctionRoutes);
router.use("/disbursement", disbursementRoutes);
router.use("/collection", collectionRoutes);

export default router;