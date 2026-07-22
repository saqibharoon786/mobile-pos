import mongoose from "mongoose";

const saleItemSchema = new mongoose.Schema(
  {
    code: String,
    qty: Number,
    sellPrice: Number,
    purchasePrice: Number,
  },
  { _id: false },
);

const paymentSchema = new mongoose.Schema(
  {
    date: String,
    amount: Number,
  },
  { _id: false },
);

const saleSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    date: { type: String, required: true },
    customer: { type: String, default: "" },
    items: [saleItemSchema],
    total: { type: Number, required: true },
    profit: { type: Number, required: true },
    paid: { type: Number, required: true },
    remaining: { type: Number, required: true },
    returnedQty: { type: Map, of: Number, default: undefined },
    payments: [paymentSchema],
  },
  { timestamps: true },
);

export const Sale = mongoose.model("Sale", saleSchema);
