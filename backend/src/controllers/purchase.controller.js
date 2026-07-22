import { purchaseService } from "../services/purchase.service.js";

export const purchaseController = {
  async list(_req, res) {
    res.json(await purchaseService.getAll());
  },

  async create(req, res) {
    res.status(201).json(await purchaseService.create(req.body));
  },

  async addPayment(req, res) {
    res.json(await purchaseService.addPayment(req.params.id, req.body.amount));
  },

  async remove(req, res) {
    await purchaseService.remove(req.params.id);
    res.status(204).send();
  },
};
