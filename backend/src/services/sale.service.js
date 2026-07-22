import { Product } from "../models/Product.model.js";
import { productRepository } from "../repositories/product.repository.js";
import { saleRepository } from "../repositories/sale.repository.js";
import { AppError } from "../utils/AppError.js";
import { createId } from "../utils/ids.js";

export const saleService = {
  async getAll() {
    return saleRepository.findAll();
  },

  async getById(id) {
    const sale = await saleRepository.findById(id);
    if (!sale) throw new AppError("Sale not found", 404);
    return sale;
  },

  async create({ items, customer, paid }) {
    if (!items?.length) throw new AppError("Items required", 400);

    for (const it of items) {
      const p = await Product.findOne({ codeLower: it.code.toLowerCase() });
      if (p) await productRepository.adjustStock(p.code, -it.qty);
    }

    const total = items.reduce((s, i) => s + i.sellPrice * i.qty, 0);
    const profit = items.reduce((s, i) => s + (i.sellPrice - i.purchasePrice) * i.qty, 0);
    const paidAmt = Math.max(0, paid ?? 0);
    const remaining = Math.max(0, total - paidAmt);
    const now = new Date().toISOString();

    return saleRepository.create({
      id: createId("S"),
      date: now,
      customer: customer ?? "",
      items,
      total,
      profit,
      paid: paidAmt,
      remaining,
      payments: paidAmt > 0 ? [{ date: now, amount: paidAmt }] : [],
    });
  },

  async addPayment(id, amount) {
    if (!(amount > 0)) throw new AppError("Amount ghalat hai", 400);

    const sale = await saleRepository.findById(id);
    if (!sale) throw new AppError("Sale not found", 404);
    if (sale.remaining <= 0) throw new AppError("Pehle se full paid hai", 400);

    const add = Math.min(amount, sale.remaining);
    sale.paid += add;
    sale.remaining = Math.max(0, sale.total - sale.paid);
    sale.payments = [
      ...(sale.payments || []),
      { date: new Date().toISOString(), amount: add },
    ];

    return saleRepository.update(sale);
  },

  async remove(id) {
    const sale = await saleRepository.findById(id);
    if (!sale) throw new AppError("Sale not found", 404);

    for (const item of sale.items) {
      const returned = sale.returnedQty?.[item.code] || 0;
      const netSold = item.qty - returned;
      if (netSold > 0) await productRepository.increaseStock(item.code, netSold);
    }

    const deleted = await saleRepository.delete(id);
    if (!deleted) throw new AppError("Sale not found", 404);
  },
};
