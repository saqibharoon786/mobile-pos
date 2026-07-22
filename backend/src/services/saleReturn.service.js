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

  async remove(id) {
    const record = await saleReturnRepository.findById(id);
    if (!record) throw new AppError("Return not found", 404);

    const sale = await saleRepository.findById(record.saleId);
    if (!sale) throw new AppError("Linked sale not found", 404);

    const returned = { ...(sale.returnedQty || {}) };
    let returnTotal = 0;
    let returnProfit = 0;

    for (const item of record.items) {
      returned[item.code] = Math.max(0, (returned[item.code] || 0) - item.qty);
      if (returned[item.code] === 0) delete returned[item.code];
      returnTotal += item.sellPrice * item.qty;
      returnProfit += (item.sellPrice - item.purchasePrice) * item.qty;
      await productRepository.adjustStock(item.code, -item.qty);
    }

    sale.returnedQty = returned;
    sale.total += returnTotal;
    sale.profit += returnProfit;
    sale.remaining = Math.max(0, sale.total - sale.paid);
    await saleRepository.update(sale);

    const deleted = await saleReturnRepository.delete(id);
    if (!deleted) throw new AppError("Return not found", 404);
  },
};
