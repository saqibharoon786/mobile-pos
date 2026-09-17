import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { repairCustomerController } from "../controllers/repairCustomer.controller.js";

const router = Router();

router.get("/", asyncHandler(repairCustomerController.list));
router.post("/", asyncHandler(repairCustomerController.create));
router.put("/:id", asyncHandler(repairCustomerController.update));
router.delete("/:id", asyncHandler(repairCustomerController.remove));

export default router;
