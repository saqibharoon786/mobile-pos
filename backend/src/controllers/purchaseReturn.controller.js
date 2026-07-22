import { purchaseReturnService } from "../services/purchaseReturn.service.js";

export const purchaseReturnController = {
  async list(_req, res) {
    res.json(await purchaseReturnService.getAll());
  },

  async create(req, res) {
    res.status(201).json(await purchaseReturnService.create(req.body));
  },
};
