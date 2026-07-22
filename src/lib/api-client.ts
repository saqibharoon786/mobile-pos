import type {
  Expense,
  LedgerCustomer,
  LedgerEntry,
  LedgerSaleItem,
  Product,
  Purchase,
  PurchaseReturn,
  Sale,
  SaleItem,
  SaleReturn,
} from "./pos-types";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError((data as { error?: string }).error || res.statusText, res.status);
  }
  return data as T;
}

export const api = {
  getProducts: () => request<Product[]>("/products"),
  saveProduct: (p: Product) =>
    request<Product>("/products", { method: "POST", body: JSON.stringify(p) }),
  deleteProduct: (code: string) =>
    request<void>(`/products/${encodeURIComponent(code)}`, { method: "DELETE" }),

  getSales: () => request<Sale[]>("/sales"),
  recordSale: (body: { items: SaleItem[]; customer: string; paid: number }) =>
    request<Sale>("/sales", { method: "POST", body: JSON.stringify(body) }),
  addSalePayment: (saleId: string, amount: number) =>
    request<Sale>(`/sales/${encodeURIComponent(saleId)}/payments`, {
      method: "POST",
      body: JSON.stringify({ amount }),
    }),

  getPurchases: () => request<Purchase[]>("/purchases"),
  recordPurchase: (body: {
    company: string;
    code: string;
    qty: number;
    purchasePrice: number;
    sellPrice: number;
    paid: number;
    note?: string;
  }) => request<Purchase>("/purchases", { method: "POST", body: JSON.stringify(body) }),
  addPurchasePayment: (purchaseId: string, amount: number) =>
    request<Purchase>(`/purchases/${encodeURIComponent(purchaseId)}/payments`, {
      method: "POST",
      body: JSON.stringify({ amount }),
    }),

  getExpenses: () => request<Expense[]>("/expenses"),
  addExpense: (body: { category: string; amount: number; note: string; date?: string }) =>
    request<Expense>("/expenses", { method: "POST", body: JSON.stringify(body) }),
  deleteExpense: (id: string) =>
    request<void>(`/expenses/${encodeURIComponent(id)}`, { method: "DELETE" }),

  getSaleReturns: () => request<SaleReturn[]>("/sale-returns"),
  recordSaleReturn: (body: {
    saleId: string;
    returnItems: { code: string; qty: number }[];
    reason: string;
  }) =>
    request<SaleReturn>("/sale-returns", { method: "POST", body: JSON.stringify(body) }),

  getPurchaseReturns: () => request<PurchaseReturn[]>("/purchase-returns"),
  recordPurchaseReturn: (body: { purchaseId: string; qty: number; reason: string }) =>
    request<PurchaseReturn>("/purchase-returns", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getLedgerCustomers: () => request<LedgerCustomer[]>("/ledger/customers"),
  addLedgerCustomer: (body: { name: string; phone?: string }) =>
    request<LedgerCustomer>("/ledger/customers", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  deleteLedgerCustomer: (id: string) =>
    request<void>(`/ledger/customers/${encodeURIComponent(id)}`, { method: "DELETE" }),

  getLedgerEntries: () => request<LedgerEntry[]>("/ledger/entries"),
  addLedgerSale: (body: {
    customerId: string;
    items: LedgerSaleItem[];
    date?: string;
    note?: string;
  }) =>
    request<LedgerEntry>("/ledger/entries/sale", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  addLedgerDirectBill: (body: {
    customerId: string;
    amount: number;
    date?: string;
    note?: string;
  }) =>
    request<LedgerEntry>("/ledger/entries/direct-bill", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  addLedgerPayment: (body: {
    customerId: string;
    amount: number;
    date?: string;
    note?: string;
  }) =>
    request<LedgerEntry>("/ledger/entries/payment", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  deleteLedgerEntry: (id: string) =>
    request<void>(`/ledger/entries/${encodeURIComponent(id)}`, { method: "DELETE" }),

  health: () => request<{ status: string }>("/health"),
};

export { ApiError };
