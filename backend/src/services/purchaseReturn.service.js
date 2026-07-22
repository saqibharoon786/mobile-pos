import { productRepository } from "../repositories/product.repository.js";
import { purchaseRepository } from "../repositories/purchase.repository.js";
import { purchaseReturnRepository } from "../repositories/purchaseReturn.repository.js";
import { AppError } from "../utils/AppError.js";
import { createId } from "../utils/ids.js";

export const purchaseReturnService = {
  async getAll() {
    return purchaseReturnRepository.findAll();
  },

  async create({ purchaseId, qty, reason }) {
    const pur = await purchaseRepository.findById(purchaseId);
    if (!pur) throw new AppError("Purchase not found", 404);

    const already = pur.returnedQty || 0;
    const remainAllowed = pur.qty - already;
    const q = Math.min(qty, remainAllowed);
    if (q <= 0) throw new AppError("Nothing to return", 400);

    await productRepository.adjustStock(pur.code, -q);

    const returnTotal = pur.purchasePrice * q;
    pur.returnedQty = already + q;
    pur.total = Math.max(0, pur.total - returnTotal);
    if (pur.paid > pur.total) pur.paid = pur.total;
    pur.remaining = Math.max(0, pur.total - pur.paid);
    await purchaseRepository.update(pur);

    return purchaseReturnRepository.create({
      id: createId("PR"),
      date: new Date().toISOString(),
      purchaseId,
      company: pur.company,
      code: pur.code,
      qty: q,
      purchasePrice: pur.purchasePrice,
      total: returnTotal,
      reason: reason ?? "",
    });
  },

  async remove(id) {
    const record = await purchaseReturnRepository.findById(id);
    if (!record) throw new AppError("Return not found", 404);

    const pur = await purchaseRepository.findById(record.purchaseId);
    if (!pur) throw new AppError("Linked purchase not found", 404);

    await productRepository.increaseStock(pur.code, record.qty);

    pur.returnedQty = Math.max(0, (pur.returnedQty || 0) - record.qty);
    pur.total += record.total;
    pur.remaining = Math.max(0, pur.total - pur.paid);
    await purchaseRepository.update(pur);

    const deleted = await purchaseReturnRepository.delete(id);
    if (!deleted) throw new AppError("Return not found", 404);
  },
};
