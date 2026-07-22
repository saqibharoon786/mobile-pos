import mongoose from "mongoose";

const ledgerSaleItemSchema = new mongoose.Schema(
  {
    code: String,
    qty: Number,
    sellPrice: Number,
  },
  { _id: false },
);

const ledgerEntrySchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    customerId: { type: String, required: true, index: true },
    date: { type: String, required: true },
    kind: { type: String, enum: ["sale", "payment"], required: true },
    items: [ledgerSaleItemSchema],
    total: { type: Number },
    amount: { type: Number },
    note: { type: String, default: null },
  },
  { timestamps: true },
);

export const LedgerEntry = mongoose.model("LedgerEntry", ledgerEntrySchema);
