import { Expense } from "../models/Expense.model.js";
import { toExpense } from "../utils/mappers.js";

export const expenseRepository = {
  async findAll() {
    const docs = await Expense.find().sort({ date: -1 }).lean();
    return docs.map(toExpense);
  },

  async findById(id) {
    const doc = await Expense.findOne({ id }).lean();
    return toExpense(doc);
  },

  async create(record) {
    const created = await Expense.create(record);
    return toExpense(created.toObject());
  },

  async update(id, { category, amount, note, date }) {
    const updated = await Expense.findOneAndUpdate(
      { id },
      { category, amount, note: note ?? "", date },
      { new: true },
    ).lean();
    return toExpense(updated);
  },

  async delete(id) {
    const result = await Expense.deleteOne({ id });
    return result.deletedCount > 0;
  },
};
