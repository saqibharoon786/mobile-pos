import { expenseService } from "../services/expense.service.js";

export const expenseController = {
  async list(_req, res) {
    res.json(await expenseService.getAll());
  },

  async create(req, res) {
    res.status(201).json(await expenseService.create(req.body));
  },

  async update(req, res) {
    res.json(await expenseService.update(req.params.id, req.body));
  },

  async remove(req, res) {
    await expenseService.remove(req.params.id);
    res.status(204).send();
  },
};
