import { LedgerCustomer, LedgerEntry } from "../models/index.js";
import { toLedgerCustomer, toLedgerEntry } from "../utils/mappers.js";

export const ledgerRepository = {
  async findAllCustomers() {
    const docs = await LedgerCustomer.find().sort({ createdAt: -1 }).lean();
    return docs.map(toLedgerCustomer);
  },

  async findCustomerByName(name) {
    return LedgerCustomer.findOne({ nameLower: name.toLowerCase() }).lean();
  },

  async findCustomerById(id) {
    const doc = await LedgerCustomer.findOne({ id }).lean();
    return toLedgerCustomer(doc);
  },

  async createCustomer({ id, name, phone, createdAt }) {
    const created = await LedgerCustomer.create({
      id,
      name,
      nameLower: name.toLowerCase(),
      phone: phone || null,
      createdAt,
    });
    return toLedgerCustomer(created.toObject());
  },

  async updateCustomerPhone(id, phone) {
    const updated = await LedgerCustomer.findOneAndUpdate(
      { id },
      { phone },
      { new: true },
    ).lean();
    return toLedgerCustomer(updated);
  },

  async deleteCustomer(id) {
    await LedgerEntry.deleteMany({ customerId: id });
    const result = await LedgerCustomer.deleteOne({ id });
    return result.deletedCount > 0;
  },

  async findAllEntries() {
    const docs = await LedgerEntry.find().sort({ date: -1 }).lean();
    return docs.map(toLedgerEntry);
  },

  async createSaleEntry({ id, customerId, date, items, total, note }) {
    const created = await LedgerEntry.create({
      id,
      customerId,
      date,
      kind: "sale",
      items,
      total,
      note: note ?? null,
    });
    return toLedgerEntry(created.toObject());
  },

  async createDirectBillEntry({ id, customerId, date, amount, note }) {
    const created = await LedgerEntry.create({
      id,
      customerId,
      date,
      kind: "sale",
      items: [],
      total: amount,
      note: note ?? null,
    });
    return toLedgerEntry(created.toObject());
  },

  async createPaymentEntry({ id, customerId, date, amount, note }) {
    const created = await LedgerEntry.create({
      id,
      customerId,
      date,
      kind: "payment",
      amount,
      note: note ?? null,
    });
    return toLedgerEntry(created.toObject());
  },

  async deleteEntry(id) {
    const result = await LedgerEntry.deleteOne({ id });
    return result.deletedCount > 0;
  },
};
