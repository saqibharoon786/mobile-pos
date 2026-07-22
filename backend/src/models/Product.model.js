import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    code: { type: String, required: true },
    codeLower: { type: String, required: true, unique: true, index: true },
    company: { type: String, default: "" },
    purchasePrice: { type: Number, default: 0 },
    sellPrice: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const Product = mongoose.model("Product", productSchema);
