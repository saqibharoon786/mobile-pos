import { expenseRepository } from "../repositories/expense.repository.js";
import { createId } from "../utils/ids.js";
import { AppError } from "../utils/AppError.js";

export const expenseService = {
  async getAll() {
    return expenseRepository.findAll();
  },

  async create({ category, amount, note, date }) {
    return expenseRepository.create({
      id: createId("E"),
      date: date || new Date().toISOString(),
      category: category ?? "",
      amount: amount ?? 0,
      note: note ?? "",
    });
  },

  async update(id, body) {
    const expense = await expenseRepository.update(id, body);
    if (!expense) throw new AppError("Expense not found", 404);
    return expense;
  },

  async remove(id) {
    const deleted = await expenseRepository.delete(id);
    if (!deleted) throw new AppError("Expense not found", 404);
  },
};
