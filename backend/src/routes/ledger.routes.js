import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ledgerController } from "../controllers/ledger.controller.js";

const router = Router();

router.get("/customers", asyncHandler(ledgerController.listCustomers));
router.post("/customers", asyncHandler(ledgerController.createCustomer));
router.delete("/customers/:id", asyncHandler(ledgerController.deleteCustomer));

router.get("/entries", asyncHandler(ledgerController.listEntries));
router.post("/entries/sale", asyncHandler(ledgerController.createSale));
router.post("/entries/direct-bill", asyncHandler(ledgerController.createDirectBill));
router.post("/entries/payment", asyncHandler(ledgerController.createPayment));
router.delete("/entries/:id", asyncHandler(ledgerController.deleteEntry));

export default router;
