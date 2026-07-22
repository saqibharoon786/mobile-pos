import { saleReturnService } from "../services/saleReturn.service.js";

export const saleReturnController = {
  async list(_req, res) {
    res.json(await saleReturnService.getAll());
  },

  async create(req, res) {
    res.status(201).json(await saleReturnService.create(req.body));
  },

  async remove(req, res) {
    await saleReturnService.remove(req.params.id);
    res.status(204).send();
  },
};
