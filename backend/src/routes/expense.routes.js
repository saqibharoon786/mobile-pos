import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { expenseController } from "../controllers/expense.controller.js";

const router = Router();

router.get("/", asyncHandler(expenseController.list));
router.post("/", asyncHandler(expenseController.create));
router.put("/:id", asyncHandler(expenseController.update));
router.delete("/:id", asyncHandler(expenseController.remove));

export default router;
