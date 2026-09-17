function mapToObject(mapVal) {
  if (!mapVal) return undefined;
  if (mapVal instanceof Map) return Object.fromEntries(mapVal);
  if (typeof mapVal === "object") return mapVal;
  return undefined;
}

export function toProduct(doc) {
  if (!doc) return null;
  return {
    code: doc.code,
    company: doc.company,
    purchasePrice: doc.purchasePrice,
    sellPrice: doc.sellPrice,
    stock: doc.stock,
  };
}

export function toSale(doc) {
  if (!doc) return null;
  return {
    id: doc.id,
    date: doc.date,
    customer: doc.customer,
    items: doc.items || [],
    total: doc.total,
    profit: doc.profit,
    paid: doc.paid,
    remaining: doc.remaining,
    returnedQty: mapToObject(doc.returnedQty),
    payments: doc.payments || undefined,
  };
}

export function toPurchase(doc) {
  if (!doc) return null;
  return {
    id: doc.id,
    date: doc.date,
    company: doc.company,
    code: doc.code,
    qty: doc.qty,
    purchasePrice: doc.purchasePrice,
    total: doc.total,
    paid: doc.paid,
    remaining: doc.remaining,
    note: doc.note,
    returnedQty: doc.returnedQty || undefined,
  };
}

export function toExpense(doc) {
  if (!doc) return null;
  return {
    id: doc.id,
    date: doc.date,
    category: doc.category,
    amount: doc.amount,
    note: doc.note,
  };
}

export function toSaleReturn(doc) {
  if (!doc) return null;
  return {
    id: doc.id,
    date: doc.date,
    saleId: doc.saleId,
    customer: doc.customer,
    items: doc.items || [],
    total: doc.total,
    reason: doc.reason,
  };
}

export function toPurchaseReturn(doc) {
  if (!doc) return null;
  return {
    id: doc.id,
    date: doc.date,
    purchaseId: doc.purchaseId,
    company: doc.company,
    code: doc.code,
    qty: doc.qty,
    purchasePrice: doc.purchasePrice,
    total: doc.total,
    reason: doc.reason,
  };
}

export function toLedgerCustomer(doc) {
  if (!doc) return null;
  return {
    id: doc.id,
    name: doc.name,
    phone: doc.phone || undefined,
    createdAt: doc.createdAt,
  };
}

export function toLedgerEntry(doc) {
  if (!doc) return null;
  if (doc.kind === "payment") {
    return {
      id: doc.id,
      customerId: doc.customerId,
      date: doc.date,
      kind: "payment",
      amount: doc.amount,
      note: doc.note || undefined,
    };
  }
  return {
    id: doc.id,
    customerId: doc.customerId,
    date: doc.date,
    kind: "sale",
    items: doc.items || [],
    total: doc.total,
    note: doc.note || undefined,
  };
}

function toRepairVisit(visit) {
  return {
    id: visit.id,
    date: visit.date,
    itemName: visit.itemName,
    productCode: visit.productCode || "",
    qty: visit.qty ?? 1,
    soldPrice: visit.soldPrice,
    purchasePrice: visit.purchasePrice ?? 0,
    note: visit.note || "",
  };
}

export function toRepairCustomer(doc) {
  if (!doc) return null;

  if (Array.isArray(doc.visits) && doc.visits.length > 0) {
    const visits = doc.visits.map(toRepairVisit).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    return {
      id: doc.id,
      customerName: doc.customerName,
      date: doc.date,
      visits,
    };
  }

  // legacy flat record
  return {
    id: doc.id,
    customerName: doc.customerName,
    date: doc.date,
    visits: [
      toRepairVisit({
        id: `${doc.id}-V1`,
        date: doc.date,
        itemName: doc.itemName || "",
        productCode: doc.productCode || "",
        qty: doc.qty ?? 1,
        soldPrice: doc.soldPrice ?? 0,
        purchasePrice: doc.actualPrice ?? doc.purchasePrice ?? 0,
        note: doc.note || "",
      }),
    ],
  };
}
