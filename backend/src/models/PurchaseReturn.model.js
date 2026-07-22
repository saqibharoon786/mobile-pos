import mongoose from "mongoose";

const purchaseReturnSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    date: { type: String, required: true },
    purchaseId: { type: String, required: true, index: true },
    company: { type: String, default: "" },
    code: { type: String, required: true },
    qty: { type: Number, required: true },
    purchasePrice: { type: Number, required: true },
    total: { type: Number, required: true },
    reason: { type: String, default: "" },
  },
  { timestamps: true },
);

export const PurchaseReturn = mongoose.model("PurchaseReturn", purchaseReturnSchema);
