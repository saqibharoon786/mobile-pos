import mongoose from "mongoose";

const ledgerCustomerSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    nameLower: { type: String, required: true, index: true },
    phone: { type: String, default: null },
    createdAt: { type: String, required: true },
  },
  { timestamps: true },
);

export const LedgerCustomer = mongoose.model("LedgerCustomer", ledgerCustomerSchema);
