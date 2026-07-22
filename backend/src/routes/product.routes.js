import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { productController } from "../controllers/product.controller.js";

const router = Router();

router.get("/", asyncHandler(productController.list));
router.get("/:code", asyncHandler(productController.get));
router.post("/", asyncHandler(productController.create));
router.put("/:code", asyncHandler(productController.update));
router.delete("/:code", asyncHandler(productController.remove));

export default router;
