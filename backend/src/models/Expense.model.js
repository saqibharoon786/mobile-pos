import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    date: { type: String, required: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    note: { type: String, default: "" },
  },
  { timestamps: true },
);

export const Expense = mongoose.model("Expense", expenseSchema);
