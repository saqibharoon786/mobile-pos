import mongoose from "mongoose";

const repairVisitSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    date: { type: String, required: true },
    itemName: { type: String, required: true },
    productCode: { type: String, default: "" },
    qty: { type: Number, default: 1 },
    soldPrice: { type: Number, required: true },
    purchasePrice: { type: Number, default: 0 },
    note: { type: String, default: "" },
  },
  { _id: false },
);

const repairCustomerSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    customerName: { type: String, required: true },
    nameLower: { type: String, required: true, unique: true, index: true },
    date: { type: String, required: true },
    visits: { type: [repairVisitSchema], default: [] },
    // legacy flat fields kept for migration reads
    itemName: { type: String },
    actualPrice: { type: Number },
    soldPrice: { type: Number },
    note: { type: String },
  },
  { timestamps: true },
);

export const RepairCustomer = mongoose.model("RepairCustomer", repairCustomerSchema);
