import { ledgerRepository } from "../repositories/ledger.repository.js";
import { AppError } from "../utils/AppError.js";
import { createId } from "../utils/ids.js";

export const ledgerService = {
  async getCustomers() {
    return ledgerRepository.findAllCustomers();
  },

  async createCustomer({ name, phone }) {
    const trimmedName = (name ?? "").trim();
    const trimmedPhone = (phone ?? "").trim();
    if (!trimmedName) throw new AppError("Name likhain", 400);

    const existing = await ledgerRepository.findCustomerByName(trimmedName);
    if (existing) {
      if (trimmedPhone && !existing.phone) {
        const customer = await ledgerRepository.updateCustomerPhone(existing.id, trimmedPhone);
        return { customer, created: false };
      }
      return {
        customer: await ledgerRepository.findCustomerById(existing.id),
        created: false,
      };
    }

    return {
      customer: await ledgerRepository.createCustomer({
        id: createId("LC"),
        name: trimmedName,
        phone: trimmedPhone,
        createdAt: new Date().toISOString(),
      }),
      created: true,
    };
  },

  async deleteCustomer(id) {
    const deleted = await ledgerRepository.deleteCustomer(id);
    if (!deleted) throw new AppError("Customer not found", 404);
  },

  async getEntries() {
    return ledgerRepository.findAllEntries();
  },

  async createSale({ customerId, items, date, note }) {
    const filtered = (items || []).filter((i) => i.qty > 0);
    if (filtered.length === 0) throw new AppError("Koi item add karain", 400);

    const total = filtered.reduce((s, i) => s + i.sellPrice * i.qty, 0);
    return ledgerRepository.createSaleEntry({
      id: createId("LS"),
      customerId,
      date: date || new Date().toISOString(),
      items: filtered,
      total,
      note,
    });
  },

  async createDirectBill({ customerId, amount, date, note }) {
    if (!(amount > 0)) throw new AppError("Amount ghalat hai", 400);
    return ledgerRepository.createDirectBillEntry({
      id: createId("LS"),
      customerId,
      date: date || new Date().toISOString(),
      amount,
      note,
    });
  },

  async createPayment({ customerId, amount, date, note }) {
    if (!(amount > 0)) throw new AppError("Amount ghalat hai", 400);
    return ledgerRepository.createPaymentEntry({
      id: createId("LP"),
      customerId,
      date: date || new Date().toISOString(),
      amount,
      note,
    });
  },

  async deleteEntry(id) {
    const deleted = await ledgerRepository.deleteEntry(id);
    if (!deleted) throw new AppError("Entry not found", 404);
  },
};
