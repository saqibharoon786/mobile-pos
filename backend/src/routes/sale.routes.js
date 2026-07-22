import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { saleController } from "../controllers/sale.controller.js";

const router = Router();

router.get("/", asyncHandler(saleController.list));
router.get("/:id", asyncHandler(saleController.get));
router.post("/", asyncHandler(saleController.create));
router.post("/:id/payments", asyncHandler(saleController.addPayment));
router.delete("/:id", asyncHandler(saleController.remove));

export default router;
