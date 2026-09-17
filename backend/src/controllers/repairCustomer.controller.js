import { repairCustomerService } from "../services/repairCustomer.service.js";

export const repairCustomerController = {
  async list(_req, res) {
    res.json(await repairCustomerService.getAll());
  },

  async create(req, res) {
    res.status(201).json(await repairCustomerService.addVisit(req.body));
  },

  async updateVisit(req, res) {
    res.json(
      await repairCustomerService.updateVisit(req.params.id, req.params.visitId, req.body),
    );
  },

  async removeVisit(req, res) {
    await repairCustomerService.removeVisit(req.params.id, req.params.visitId);
    res.status(204).send();
  },

  async remove(req, res) {
    await repairCustomerService.remove(req.params.id);
    res.status(204).send();
  },
};
