import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { saleReturnController } from "../controllers/saleReturn.controller.js";

const router = Router();

router.get("/", asyncHandler(saleReturnController.list));
router.post("/", asyncHandler(saleReturnController.create));

export default router;
