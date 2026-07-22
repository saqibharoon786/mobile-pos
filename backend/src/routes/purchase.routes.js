import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { purchaseController } from "../controllers/purchase.controller.js";

const router = Router();

router.get("/", asyncHandler(purchaseController.list));
router.post("/", asyncHandler(purchaseController.create));
router.post("/:id/payments", asyncHandler(purchaseController.addPayment));
router.delete("/:id", asyncHandler(purchaseController.remove));

export default router;
