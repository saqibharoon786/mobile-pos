import { Product } from "../models/Product.model.js";
import { toProduct } from "../utils/mappers.js";

export const productRepository = {
  async findAll() {
    const docs = await Product.find().sort({ code: 1 }).lean();
    return docs.map(toProduct);
  },

  async findByCode(code) {
    const doc = await Product.findOne({ codeLower: code.toLowerCase() }).lean();
    return toProduct(doc);
  },

  async upsert({ code, company, purchasePrice, sellPrice, stock }) {
    const codeLower = code.toLowerCase();
    const existing = await Product.findOne({ codeLower });

    if (existing) {
      existing.company = company ?? existing.company;
      existing.purchasePrice = purchasePrice ?? existing.purchasePrice;
      existing.sellPrice = sellPrice ?? existing.sellPrice;
      existing.stock = existing.stock + (stock ?? 0);
      await existing.save();
      return { product: toProduct(existing.toObject()), created: false };
    }

    const created = await Product.create({
      code,
      codeLower,
      company: company ?? "",
      purchasePrice: purchasePrice ?? 0,
      sellPrice: sellPrice ?? 0,
      stock: stock ?? 0,
    });
    return { product: toProduct(created.toObject()), created: true };
  },

  async update(code, { company, purchasePrice, sellPrice, stock }) {
    const doc = await Product.findOneAndUpdate(
      { codeLower: code.toLowerCase() },
      {
        company: company ?? "",
        purchasePrice: purchasePrice ?? 0,
        sellPrice: sellPrice ?? 0,
        stock: stock ?? 0,
      },
      { new: true },
    ).lean();
    return toProduct(doc);
  },

  async delete(code) {
    const result = await Product.deleteOne({ codeLower: code.toLowerCase() });
    return result.deletedCount > 0;
  },

  async adjustStock(code, delta) {
    const doc = await Product.findOne({ codeLower: code.toLowerCase() });
    if (!doc) return;
    doc.stock = Math.max(0, doc.stock + delta);
    await doc.save();
  },

  async increaseStock(code, qty) {
    const doc = await Product.findOne({ codeLower: code.toLowerCase() });
    if (!doc) return;
    doc.stock += qty;
    await doc.save();
  },
};
