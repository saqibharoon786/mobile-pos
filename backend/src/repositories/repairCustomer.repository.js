import { RepairCustomer } from "../models/index.js";
import { toRepairCustomer } from "../utils/mappers.js";

export const repairCustomerRepository = {
  async findAllRaw() {
    return RepairCustomer.find().lean();
  },

  async findAll() {
    const docs = await RepairCustomer.find().sort({ date: -1, updatedAt: -1 }).lean();
    return docs.map(toRepairCustomer);
  },

  async findById(id) {
    const doc = await RepairCustomer.findOne({ id }).lean();
    return toRepairCustomer(doc);
  },

  async findByNameLower(nameLower) {
    const doc = await RepairCustomer.findOne({ nameLower }).lean();
    return toRepairCustomer(doc);
  },

  async findLegacyByNameLower(nameLower) {
    return RepairCustomer.find({
      nameLower: { $exists: false },
      customerName: new RegExp(`^${nameLower.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
    }).lean();
  },

  async create(record) {
    const created = await RepairCustomer.create(record);
    return toRepairCustomer(created.toObject());
  },

  async save(record) {
    const updated = await RepairCustomer.findOneAndUpdate(
      { id: record.id },
      {
        customerName: record.customerName,
        nameLower: record.nameLower,
        date: record.date,
        visits: record.visits,
        $unset: { itemName: "", actualPrice: "", soldPrice: "", note: "" },
      },
      { new: true, upsert: false },
    ).lean();
    return toRepairCustomer(updated);
  },

  async delete(id) {
    const result = await RepairCustomer.deleteOne({ id });
    return result.deletedCount > 0;
  },

  async deleteMany(ids) {
    if (!ids.length) return;
    await RepairCustomer.deleteMany({ id: { $in: ids } });
  },
};
