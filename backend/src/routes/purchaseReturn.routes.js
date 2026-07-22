import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { purchaseReturnController } from "../controllers/purchaseReturn.controller.js";

const router = Router();

router.get("/", asyncHandler(purchaseReturnController.list));
router.post("/", asyncHandler(purchaseReturnController.create));
router.delete("/:id", asyncHandler(purchaseReturnController.remove));

export default router;
