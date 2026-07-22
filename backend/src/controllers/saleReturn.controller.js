import { saleReturnService } from "../services/saleReturn.service.js";

export const saleReturnController = {
  async list(_req, res) {
    res.json(await saleReturnService.getAll());
  },

  async create(req, res) {
    res.status(201).json(await saleReturnService.create(req.body));
  },
};
