import mongoose from "mongoose";

const saleReturnItemSchema = new mongoose.Schema(
  {
    code: String,
    qty: Number,
    sellPrice: Number,
    purchasePrice: Number,
  },
  { _id: false },
);

const saleReturnSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    date: { type: String, required: true },
    saleId: { type: String, required: true, index: true },
    customer: { type: String, default: "" },
    items: [saleReturnItemSchema],
    total: { type: Number, required: true },
    reason: { type: String, default: "" },
  },
  { timestamps: true },
);

export const SaleReturn = mongoose.model("SaleReturn", saleReturnSchema);
