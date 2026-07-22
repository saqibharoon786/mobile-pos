import { SaleReturn } from "../models/SaleReturn.model.js";
import { toSaleReturn } from "../utils/mappers.js";

export const saleReturnRepository = {
  async findAll() {
    const docs = await SaleReturn.find().sort({ date: -1 }).lean();
    return docs.map(toSaleReturn);
  },

  async findById(id) {
    const doc = await SaleReturn.findOne({ id }).lean();
    return toSaleReturn(doc);
  },

  async create(record) {
    const created = await SaleReturn.create(record);
    return toSaleReturn(created.toObject());
  },

  async delete(id) {
    const result = await SaleReturn.deleteOne({ id });
    return result.deletedCount > 0;
  },
};
