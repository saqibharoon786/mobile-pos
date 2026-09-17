import { RepairCustomer } from "../models/index.js";
import { toRepairCustomer } from "../utils/mappers.js";

export const repairCustomerRepository = {
  async findAll() {
    const docs = await RepairCustomer.find().sort({ date: -1, createdAt: -1 }).lean();
    return docs.map(toRepairCustomer);
  },

  async findById(id) {
    const doc = await RepairCustomer.findOne({ id }).lean();
    return toRepairCustomer(doc);
  },

  async create(record) {
    const created = await RepairCustomer.create(record);
    return toRepairCustomer(created.toObject());
  },

  async update(id, fields) {
    const updated = await RepairCustomer.findOneAndUpdate({ id }, fields, { new: true }).lean();
    return toRepairCustomer(updated);
  },

  async delete(id) {
    const result = await RepairCustomer.deleteOne({ id });
    return result.deletedCount > 0;
  },
};
