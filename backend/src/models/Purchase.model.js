import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    date: { type: String, required: true },
    company: { type: String, default: "" },
    code: { type: String, required: true },
    qty: { type: Number, required: true },
    purchasePrice: { type: Number, required: true },
    total: { type: Number, required: true },
    paid: { type: Number, required: true },
    remaining: { type: Number, required: true },
    note: { type: String, default: "" },
    returnedQty: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const Purchase = mongoose.model("Purchase", purchaseSchema);
