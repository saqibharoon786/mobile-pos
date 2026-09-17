import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { repairCustomerController } from "../controllers/repairCustomer.controller.js";

const router = Router();

router.get("/", asyncHandler(repairCustomerController.list));
router.post("/", asyncHandler(repairCustomerController.create));
router.put("/:id/visits/:visitId", asyncHandler(repairCustomerController.updateVisit));
router.delete("/:id/visits/:visitId", asyncHandler(repairCustomerController.removeVisit));
router.delete("/:id", asyncHandler(repairCustomerController.remove));

export default router;
