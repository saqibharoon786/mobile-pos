import { Router } from "express";
import productRoutes from "./product.routes.js";
import saleRoutes from "./sale.routes.js";
import purchaseRoutes from "./purchase.routes.js";
import expenseRoutes from "./expense.routes.js";
import saleReturnRoutes from "./saleReturn.routes.js";
import purchaseReturnRoutes from "./purchaseReturn.routes.js";
import ledgerRoutes from "./ledger.routes.js";
import authRoutes from "./auth.routes.js";
import { healthController } from "../controllers/health.controller.js";
import repairCustomerRoutes from "./repairCustomer.routes.js";

const router = Router();

router.get("/health", healthController.check);

router.use("/auth", authRoutes);

router.use("/products", productRoutes);
router.use("/sales", saleRoutes);
router.use("/purchases", purchaseRoutes);
router.use("/expenses", expenseRoutes);
router.use("/sale-returns", saleReturnRoutes);
router.use("/purchase-returns", purchaseReturnRoutes);
router.use("/ledger", ledgerRoutes);
router.use("/repair-customers", repairCustomerRoutes);

export default router;
