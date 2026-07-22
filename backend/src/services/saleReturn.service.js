import { productRepository } from "../repositories/product.repository.js";
import { saleRepository } from "../repositories/sale.repository.js";
import { saleReturnRepository } from "../repositories/saleReturn.repository.js";
import { AppError } from "../utils/AppError.js";
import { createId } from "../utils/ids.js";

export const saleReturnService = {
  async getAll() {
    return saleReturnRepository.findAll();
  },

  async create({ saleId, returnItems, reason }) {
    const sale = await saleRepository.findById(saleId);
    if (!sale) throw new AppError("Sale not found", 404);

    const returned = { ...(sale.returnedQty || {}) };
    const items = [];

    for (const r of returnItems || []) {
      if (r.qty <= 0) continue;
      const orig = sale.items.find((i) => i.code === r.code);
      if (!orig) continue;
      const already = returned[r.code] || 0;
      const remainAllowed = orig.qty - already;
      const q = Math.min(r.qty, remainAllowed);
      if (q <= 0) continue;

      returned[r.code] = already + q;
      items.push({
        code: r.code,
        qty: q,
        sellPrice: orig.sellPrice,
        purchasePrice: orig.purchasePrice,
      });
      await productRepository.increaseStock(r.code, q);
    }

    if (items.length === 0) throw new AppError("Nothing to return", 400);

    const returnTotal = items.reduce((s, i) => s + i.sellPrice * i.qty, 0);
    const returnProfit = items.reduce(
      (s, i) => s + (i.sellPrice - i.purchasePrice) * i.qty,
      0,
    );

    sale.returnedQty = returned;
    sale.total = Math.max(0, sale.total - returnTotal);
    sale.profit = sale.profit - returnProfit;
    if (sale.paid > sale.total) sale.paid = sale.total;
    sale.remaining = Math.max(0, sale.total - sale.paid);
    await saleRepository.update(sale);

    return saleReturnRepository.create({
      id: createId("SR"),
      date: new Date().toISOString(),
      saleId,
      customer: sale.customer,
      items,
      total: returnTotal,
      reason: reason ?? "",
    });
  },
};
