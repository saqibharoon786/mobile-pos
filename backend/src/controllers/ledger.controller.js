import { ledgerService } from "../services/ledger.service.js";

export const ledgerController = {
  async listCustomers(_req, res) {
    res.json(await ledgerService.getCustomers());
  },

  async createCustomer(req, res) {
    const { customer, created } = await ledgerService.createCustomer(req.body);
    res.status(created ? 201 : 200).json(customer);
  },

  async deleteCustomer(req, res) {
    await ledgerService.deleteCustomer(req.params.id);
    res.status(204).send();
  },

  async listEntries(_req, res) {
    res.json(await ledgerService.getEntries());
  },

  async createSale(req, res) {
    res.status(201).json(await ledgerService.createSale(req.body));
  },

  async createDirectBill(req, res) {
    res.status(201).json(await ledgerService.createDirectBill(req.body));
  },

  async createPayment(req, res) {
    res.status(201).json(await ledgerService.createPayment(req.body));
  },

  async deleteEntry(req, res) {
    await ledgerService.deleteEntry(req.params.id);
    res.status(204).send();
  },
};
