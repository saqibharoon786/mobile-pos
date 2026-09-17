import mongoose from "mongoose";

const repairCustomerSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    date: { type: String, required: true },
    customerName: { type: String, required: true },
    itemName: { type: String, required: true },
    actualPrice: { type: Number, required: true },
    soldPrice: { type: Number, required: true },
    note: { type: String, default: "" },
  },
  { timestamps: true },
);

export const RepairCustomer = mongoose.model("RepairCustomer", repairCustomerSchema);
