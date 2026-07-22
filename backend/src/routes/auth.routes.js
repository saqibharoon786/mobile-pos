import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authController } from "../controllers/auth.controller.js";

const router = Router();

router.post("/login", asyncHandler(authController.login));
router.get("/me", asyncHandler(authController.me));

export default router;
