import { Purchase } from "../models/Purchase.model.js";
import { toPurchase } from "../utils/mappers.js";

export const purchaseRepository = {
  async findAll() {
    const docs = await Purchase.find().sort({ date: -1 }).lean();
    return docs.map(toPurchase);
  },

  async findById(id) {
    const doc = await Purchase.findOne({ id }).lean();
    return toPurchase(doc);
  },

  async create(record) {
    const created = await Purchase.create(record);
    return toPurchase(created.toObject());
  },

  async update(purchase) {
    const updated = await Purchase.findOneAndUpdate(
      { id: purchase.id },
      {
        total: purchase.total,
        paid: purchase.paid,
        remaining: purchase.remaining,
        returnedQty: purchase.returnedQty ?? 0,
      },
      { new: true },
    ).lean();
    return toPurchase(updated);
  },

  async delete(id) {
    const result = await Purchase.deleteOne({ id });
    return result.deletedCount > 0;
  },
};
