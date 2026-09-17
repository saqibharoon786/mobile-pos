import { repairCustomerService } from "../services/repairCustomer.service.js";

export const repairCustomerController = {
  async list(_req, res) {
    res.json(await repairCustomerService.getAll());
  },

  async create(req, res) {
    res.status(201).json(await repairCustomerService.create(req.body));
  },

  async update(req, res) {
    res.json(await repairCustomerService.update(req.params.id, req.body));
  },

  async remove(req, res) {
    await repairCustomerService.remove(req.params.id);
    res.status(204).send();
  },
};
