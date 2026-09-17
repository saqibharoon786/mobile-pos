import { repairCustomerRepository } from "../repositories/repairCustomer.repository.js";
import { AppError } from "../utils/AppError.js";
import { createId } from "../utils/ids.js";

export const repairCustomerService = {
  async getAll() {
    return repairCustomerRepository.findAll();
  },

  async create({ customerName, itemName, actualPrice, soldPrice, note, date }) {
    const trimmedCustomerName = (customerName ?? "").trim();
    const trimmedItemName = (itemName ?? "").trim();
    if (!trimmedCustomerName) throw new AppError("Customer ka naam likhain", 400);
    if (!trimmedItemName) throw new AppError("Item ya battery ka naam likhain", 400);
    if (!(Number(actualPrice) >= 0) || !(Number(soldPrice) >= 0)) {
      throw new AppError("Prices ghalat hain", 400);
    }

    return repairCustomerRepository.create({
      id: createId("RC"),
      date: date || new Date().toISOString(),
      customerName: trimmedCustomerName,
      itemName: trimmedItemName,
      actualPrice: Number(actualPrice),
      soldPrice: Number(soldPrice),
      note: (note ?? "").trim(),
    });
  },

  async update(id, body) {
    const existing = await repairCustomerRepository.findById(id);
    if (!existing) throw new AppError("Repair customer not found", 404);

    const trimmedCustomerName = (body.customerName ?? existing.customerName).trim();
    const trimmedItemName = (body.itemName ?? existing.itemName).trim();
    if (!trimmedCustomerName) throw new AppError("Customer ka naam likhain", 400);
    if (!trimmedItemName) throw new AppError("Item ya battery ka naam likhain", 400);

    const actualPrice = body.actualPrice ?? existing.actualPrice;
    const soldPrice = body.soldPrice ?? existing.soldPrice;
    if (!(Number(actualPrice) >= 0) || !(Number(soldPrice) >= 0)) {
      throw new AppError("Prices ghalat hain", 400);
    }

    return repairCustomerRepository.update(id, {
      date: body.date ?? existing.date,
      customerName: trimmedCustomerName,
      itemName: trimmedItemName,
      actualPrice: Number(actualPrice),
      soldPrice: Number(soldPrice),
      note: (body.note ?? existing.note ?? "").trim(),
    });
  },

  async remove(id) {
    const deleted = await repairCustomerRepository.delete(id);
    if (!deleted) throw new AppError("Repair customer not found", 404);
  },
};
