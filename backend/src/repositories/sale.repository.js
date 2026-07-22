import { Sale } from "../models/Sale.model.js";
import { toSale } from "../utils/mappers.js";

export const saleRepository = {
  async findAll() {
    const docs = await Sale.find().sort({ date: -1 }).lean();
    return docs.map(toSale);
  },

  async findById(id) {
    const doc = await Sale.findOne({ id }).lean();
    return toSale(doc);
  },

  async create(record) {
    const created = await Sale.create({
      ...record,
      returnedQty: record.returnedQty || undefined,
      payments: record.payments || [],
    });
    return toSale(created.toObject());
  },

  async update(sale) {
    const updated = await Sale.findOneAndUpdate(
      { id: sale.id },
      {
        total: sale.total,
        profit: sale.profit,
        paid: sale.paid,
        remaining: sale.remaining,
        returnedQty: sale.returnedQty || undefined,
        payments: sale.payments || [],
      },
      { new: true },
    ).lean();
    return toSale(updated);
  },

  async delete(id) {
    const result = await Sale.deleteOne({ id });
    return result.deletedCount > 0;
  },
};
