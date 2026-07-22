import { PurchaseReturn } from "../models/PurchaseReturn.model.js";
import { toPurchaseReturn } from "../utils/mappers.js";

export const purchaseReturnRepository = {
  async findAll() {
    const docs = await PurchaseReturn.find().sort({ date: -1 }).lean();
    return docs.map(toPurchaseReturn);
  },

  async findById(id) {
    const doc = await PurchaseReturn.findOne({ id }).lean();
    return toPurchaseReturn(doc);
  },

  async create(record) {
    const created = await PurchaseReturn.create(record);
    return toPurchaseReturn(created.toObject());
  },

  async delete(id) {
    const result = await PurchaseReturn.deleteOne({ id });
    return result.deletedCount > 0;
  },
};
