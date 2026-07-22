export type Product = {
  code: string;
  company: string;
  purchasePrice: number;
  sellPrice: number;
  stock: number;
};

export type SaleItem = {
  code: string;
  qty: number;
  sellPrice: number;
  purchasePrice: number;
};

export type PaymentEntry = { date: string; amount: number };

export type Sale = {
  id: string;
  date: string;
  customer: string;
  items: SaleItem[];
  total: number;
  profit: number;
  paid: number;
  remaining: number;
  returnedQty?: Record<string, number>;
  payments?: PaymentEntry[];
};

export type Expense = {
  id: string;
  date: string;
  category: string;
  amount: number;
  note: string;
};

export type Purchase = {
  id: string;
  date: string;
  company: string;
  code: string;
  qty: number;
  purchasePrice: number;
  total: number;
  paid: number;
  remaining: number;
  note: string;
  returnedQty?: number;
};

export type SaleReturn = {
  id: string;
  date: string;
  saleId: string;
  customer: string;
  items: { code: string; qty: number; sellPrice: number; purchasePrice: number }[];
  total: number;
  reason: string;
};

export type PurchaseReturn = {
  id: string;
  date: string;
  purchaseId: string;
  company: string;
  code: string;
  qty: number;
  purchasePrice: number;
  total: number;
  reason: string;
};

export type LedgerCustomer = {
  id: string;
  name: string;
  phone?: string;
  createdAt: string;
};

export type LedgerSaleItem = {
  code: string;
  qty: number;
  sellPrice: number;
};

export type LedgerEntry =
  | {
      id: string;
      customerId: string;
      date: string;
      kind: "sale";
      items: LedgerSaleItem[];
      total: number;
      note?: string;
    }
  | {
      id: string;
      customerId: string;
      date: string;
      kind: "payment";
      amount: number;
      note?: string;
    };
