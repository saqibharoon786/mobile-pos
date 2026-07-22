import { saleService } from "../services/sale.service.js";

export const saleController = {
  async list(_req, res) {
    res.json(await saleService.getAll());
  },

  async get(req, res) {
    res.json(await saleService.getById(req.params.id));
  },

  async create(req, res) {
    res.status(201).json(await saleService.create(req.body));
  },

  async addPayment(req, res) {
    res.json(await saleService.addPayment(req.params.id, req.body.amount));
  },

  async remove(req, res) {
    await saleService.remove(req.params.id);
    res.status(204).send();
  },
};
