import { productRepository } from "../repositories/product.repository.js";
import { repairCustomerRepository } from "../repositories/repairCustomer.repository.js";
import { AppError } from "../utils/AppError.js";
import { createId } from "../utils/ids.js";

function normalizeName(name) {
  return (name ?? "").trim().toLowerCase();
}

function visitProfit(visit) {
  const qty = visit.qty ?? 1;
  return visit.soldPrice - (visit.purchasePrice ?? 0) * qty;
}

async function deductStock(productCode, qty) {
  if (!productCode?.trim() || !(qty > 0)) return;
  const product = await productRepository.findByCode(productCode.trim());
  if (!product) throw new AppError(`Product "${productCode}" POP mein nahi mila`, 404);
  if (product.stock < qty) {
    throw new AppError(`"${productCode}" ka stock kam hai (available: ${product.stock})`, 400);
  }
  await productRepository.adjustStock(product.code, -qty);
}

async function restoreStock(productCode, qty) {
  if (!productCode?.trim() || !(qty > 0)) return;
  const product = await productRepository.findByCode(productCode.trim());
  if (product) await productRepository.increaseStock(product.code, qty);
}

async function migrateLegacyRecords() {
  const raw = await repairCustomerRepository.findAllRaw();
  const legacy = raw.filter((doc) => !Array.isArray(doc.visits) || doc.visits.length === 0);
  if (legacy.length === 0) return;

  const groups = new Map();
  for (const doc of legacy) {
    const key = normalizeName(doc.customerName);
    if (!key) continue;
    const list = groups.get(key) ?? [];
    list.push(doc);
    groups.set(key, list);
  }

  for (const [nameLower, docs] of groups) {
    docs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const legacyVisits = docs.map((doc, index) => ({
      id: `${doc.id}-V${index + 1}`,
      date: doc.date,
      itemName: doc.itemName || "",
      productCode: doc.productCode || "",
      qty: doc.qty ?? 1,
      soldPrice: doc.soldPrice ?? 0,
      purchasePrice: doc.actualPrice ?? doc.purchasePrice ?? 0,
      note: doc.note || "",
    }));

    const primary = docs[0];
    const existing = await repairCustomerRepository.findByNameLower(nameLower);

    await repairCustomerRepository.deleteMany(docs.map((d) => d.id));

    if (existing?.visits?.length) {
      const visits = [...existing.visits, ...legacyVisits].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
      await repairCustomerRepository.save({
        id: existing.id,
        customerName: existing.customerName,
        nameLower,
        date: visits[0].date,
        visits,
      });
    } else {
      await repairCustomerRepository.create({
        id: primary.id,
        customerName: primary.customerName.trim(),
        nameLower,
        date: legacyVisits[legacyVisits.length - 1].date,
        visits: legacyVisits,
      });
    }
  }
}

function buildVisit({ itemName, productCode, qty, soldPrice, purchasePrice, date, note }) {
  return {
    id: createId("RV"),
    date: date || new Date().toISOString(),
    itemName: itemName.trim(),
    productCode: (productCode ?? "").trim(),
    qty: Math.max(1, Number(qty) || 1),
    soldPrice: Number(soldPrice),
    purchasePrice: Number(purchasePrice) || 0,
    note: (note ?? "").trim(),
  };
}

export const repairCustomerService = {
  async getAll() {
    await migrateLegacyRecords();
    const records = await repairCustomerRepository.findAll();
    return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  async addVisit({ customerName, itemName, productCode, qty, soldPrice, note, date }) {
    await migrateLegacyRecords();

    const trimmedCustomerName = (customerName ?? "").trim();
    const trimmedItemName = (itemName ?? "").trim();
    const nameLower = normalizeName(trimmedCustomerName);

    if (!trimmedCustomerName) throw new AppError("Customer ka naam likhain", 400);
    if (!trimmedItemName) throw new AppError("Battery ya item ka naam likhain", 400);
    if (!(Number(soldPrice) >= 0)) throw new AppError("Price ghalat hai", 400);

    const q = Math.max(1, Number(qty) || 1);
    const code = (productCode ?? "").trim();
    if (!code) throw new AppError("POP se product select karain", 400);

    const product = await productRepository.findByCode(code);
    if (!product) throw new AppError(`Product "${code}" POP mein nahi mila`, 404);
    const purchasePrice = product.purchasePrice;
    await deductStock(code, q);

    const visit = buildVisit({
      itemName: trimmedItemName,
      productCode: code,
      qty: q,
      soldPrice: Number(soldPrice),
      purchasePrice,
      date,
      note,
    });

    let existing = await repairCustomerRepository.findByNameLower(nameLower);
    if (!existing) {
      return repairCustomerRepository.create({
        id: createId("RC"),
        customerName: trimmedCustomerName,
        nameLower,
        date: visit.date,
        visits: [visit],
      });
    }

    const visits = [...existing.visits, visit].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    return repairCustomerRepository.save({
      id: existing.id,
      customerName: trimmedCustomerName,
      nameLower,
      date: visits[0].date,
      visits,
    });
  },

  async updateVisit(customerId, visitId, body) {
    await migrateLegacyRecords();

    const existing = await repairCustomerRepository.findById(customerId);
    if (!existing) throw new AppError("Repair customer not found", 404);

    const visitIndex = existing.visits.findIndex((v) => v.id === visitId);
    if (visitIndex < 0) throw new AppError("Visit not found", 404);

    const current = existing.visits[visitIndex];
    const nextCode = (body.productCode ?? current.productCode).trim();
    const nextQty = Math.max(1, Number(body.qty ?? current.qty) || 1);
    const nextItemName = (body.itemName ?? current.itemName).trim();
    const nextSold = Number(body.soldPrice ?? current.soldPrice);
    const nextNote = (body.note ?? current.note ?? "").trim();
    const nextDate = body.date ?? current.date;

    if (!nextItemName) throw new AppError("Battery ya item ka naam likhain", 400);
    if (!(nextSold >= 0)) throw new AppError("Price ghalat hai", 400);

    const oldCode = (current.productCode || "").trim();
    const oldQty = current.qty ?? 1;

    if (oldCode && oldQty > 0) await restoreStock(oldCode, oldQty);

    let purchasePrice = current.purchasePrice ?? 0;
    if (nextCode) {
      const product = await productRepository.findByCode(nextCode);
      if (!product) throw new AppError(`Product "${nextCode}" POP mein nahi mila`, 404);
      purchasePrice = product.purchasePrice;
      await deductStock(nextCode, nextQty);
    } else {
      purchasePrice = 0;
    }

    const visits = [...existing.visits];
    visits[visitIndex] = {
      ...current,
      date: nextDate,
      itemName: nextItemName,
      productCode: nextCode,
      qty: nextQty,
      soldPrice: nextSold,
      purchasePrice,
      note: nextNote,
    };

    visits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return repairCustomerRepository.save({
      id: existing.id,
      customerName: (body.customerName ?? existing.customerName).trim(),
      nameLower: normalizeName(body.customerName ?? existing.customerName),
      date: visits[0].date,
      visits,
    });
  },

  async removeVisit(customerId, visitId) {
    await migrateLegacyRecords();

    const existing = await repairCustomerRepository.findById(customerId);
    if (!existing) throw new AppError("Repair customer not found", 404);

    const visit = existing.visits.find((v) => v.id === visitId);
    if (!visit) throw new AppError("Visit not found", 404);

    if (visit.productCode?.trim()) {
      await restoreStock(visit.productCode, visit.qty ?? 1);
    }

    const visits = existing.visits.filter((v) => v.id !== visitId);
    if (visits.length === 0) {
      await repairCustomerRepository.delete(customerId);
      return;
    }

    visits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return repairCustomerRepository.save({
      id: existing.id,
      customerName: existing.customerName,
      nameLower: normalizeName(existing.customerName),
      date: visits[0].date,
      visits,
    });
  },

  async remove(id) {
    await migrateLegacyRecords();

    const existing = await repairCustomerRepository.findById(id);
    if (!existing) throw new AppError("Repair customer not found", 404);

    for (const visit of existing.visits) {
      if (visit.productCode?.trim()) {
        await restoreStock(visit.productCode, visit.qty ?? 1);
      }
    }

    const deleted = await repairCustomerRepository.delete(id);
    if (!deleted) throw new AppError("Repair customer not found", 404);
  },

  getStats(records) {
    let revenue = 0;
    let profit = 0;
    let visits = 0;

    for (const record of records) {
      for (const visit of record.visits || []) {
        visits += 1;
        revenue += visit.soldPrice;
        profit += visitProfit(visit);
      }
    }

    return { revenue, profit, visits };
  },
};
