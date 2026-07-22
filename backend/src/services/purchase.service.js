import { purchaseRepository } from "../repositories/purchase.repository.js";
import { productRepository } from "../repositories/product.repository.js";
import { AppError } from "../utils/AppError.js";
import { createId } from "../utils/ids.js";

export const purchaseService = {
  async getAll() {
    return purchaseRepository.findAll();
  },

  async create({ company, code, qty, purchasePrice, sellPrice, paid, note }) {
    const trimmedCode = code?.trim();
    if (!trimmedCode) throw new AppError("Code required", 400);

    await productRepository.upsert({
      code: trimmedCode,
      company,
      purchasePrice,
      sellPrice,
      stock: qty,
    });

    const total = purchasePrice * qty;
    const paidAmt = Math.max(0, paid ?? 0);
    const remaining = Math.max(0, total - paidAmt);

    return purchaseRepository.create({
      id: createId("P"),
      date: new Date().toISOString(),
      company: company ?? "",
      code: trimmedCode,
      qty,
      purchasePrice,
      total,
      paid: paidAmt,
      remaining,
      note: note ?? "",
    });
  },

  async addPayment(id, amount) {
    if (!(amount > 0)) throw new AppError("Amount ghalat hai", 400);

    const purchase = await purchaseRepository.findById(id);
    if (!purchase) throw new AppError("Purchase not found", 404);
    if (purchase.remaining <= 0) throw new AppError("Pehle se full paid hai", 400);

    const add = Math.min(amount, purchase.remaining);
    purchase.paid += add;
    purchase.remaining = Math.max(0, purchase.total - purchase.paid);

    return purchaseRepository.update(purchase);
  },

  async remove(id) {
    const purchase = await purchaseRepository.findById(id);
    if (!purchase) throw new AppError("Purchase not found", 404);

    const netQty = purchase.qty - (purchase.returnedQty || 0);
    if (netQty > 0) await productRepository.adjustStock(purchase.code, -netQty);

    const deleted = await purchaseRepository.delete(id);
    if (!deleted) throw new AppError("Purchase not found", 404);
  },
};
