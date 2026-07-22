import { SaleReturn } from "../models/SaleReturn.model.js";
import { toSaleReturn } from "../utils/mappers.js";

export const saleReturnRepository = {
  async findAll() {
    const docs = await SaleReturn.find().sort({ date: -1 }).lean();
    return docs.map(toSaleReturn);
  },

  async create(record) {
    const created = await SaleReturn.create(record);
    return toSaleReturn(created.toObject());
  },
};
