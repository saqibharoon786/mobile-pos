import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "./api-client";
import { invalidate, queryKeys } from "./query-client";

export type {
  Product,
  SaleItem,
  PaymentEntry,
  Sale,
  Expense,
  Purchase,
  SaleReturn,
  PurchaseReturn,
  LedgerCustomer,
  LedgerSaleItem,
  LedgerEntry,
} from "./pos-types";

import type {
  Expense,
  LedgerCustomer,
  LedgerEntry,
  LedgerSaleItem,
  Product,
  Sale,
  SaleItem,
} from "./pos-types";

function useListQuery<T>(key: readonly string[], fetcher: () => Promise<T[]>) {
  const { data = [] } = useQuery({
    queryKey: key,
    queryFn: fetcher,
    enabled: typeof window !== "undefined",
  });
  return data;
}

export function useProducts() {
  return useListQuery(queryKeys.products, api.getProducts);
}

export function useSales() {
  return useListQuery(queryKeys.sales, api.getSales);
}

export function useExpenses() {
  return useListQuery(queryKeys.expenses, api.getExpenses);
}

export function usePurchases() {
  return useListQuery(queryKeys.purchases, api.getPurchases);
}

export function useSaleReturns() {
  return useListQuery(queryKeys.saleReturns, api.getSaleReturns);
}

export function usePurchaseReturns() {
  return useListQuery(queryKeys.purchaseReturns, api.getPurchaseReturns);
}

export function useLedgerCustomers() {
  return useListQuery(queryKeys.ledgerCustomers, api.getLedgerCustomers);
}

export function useLedgerEntries() {
  return useListQuery(queryKeys.ledgerEntries, api.getLedgerEntries);
}

export async function addLedgerCustomer(input: string | { name: string; phone?: string }) {
  const body =
    typeof input === "string" ? { name: input.trim() } : { name: input.name.trim(), phone: input.phone };
  const result = await api.addLedgerCustomer(body);
  await invalidate(queryKeys.ledgerCustomers);
  return result;
}

export async function addLedgerDirectBill(input: {
  customerId: string;
  amount: number;
  date?: string;
  note?: string;
}) {
  const result = await api.addLedgerDirectBill(input);
  await invalidate(queryKeys.ledgerEntries);
  return result;
}

export async function deleteLedgerCustomer(customerId: string) {
  await api.deleteLedgerCustomer(customerId);
  await invalidate(queryKeys.ledgerCustomers, queryKeys.ledgerEntries);
}

export async function addLedgerSale(input: {
  customerId: string;
  items: LedgerSaleItem[];
  date?: string;
  note?: string;
}) {
  const result = await api.addLedgerSale(input);
  await invalidate(queryKeys.ledgerEntries);
  return result;
}

export async function addLedgerPayment(input: {
  customerId: string;
  amount: number;
  date?: string;
  note?: string;
}) {
  const result = await api.addLedgerPayment(input);
  await invalidate(queryKeys.ledgerEntries);
  return result;
}

export async function deleteLedgerEntry(entryId: string) {
  await api.deleteLedgerEntry(entryId);
  await invalidate(queryKeys.ledgerEntries);
}

export async function saveProduct(p: Product) {
  const result = await api.saveProduct(p);
  await invalidate(queryKeys.products);
  return result;
}

export async function deleteProduct(code: string) {
  await api.deleteProduct(code);
  await invalidate(queryKeys.products);
}

export async function recordSale(
  items: SaleItem[],
  opts: { customer: string; paid: number },
) {
  const result = await api.recordSale({ items, customer: opts.customer, paid: opts.paid });
  await invalidate(queryKeys.products, queryKeys.sales);
  return result;
}

export async function addSalePayment(saleId: string, amount: number) {
  const result = await api.addSalePayment(saleId, amount);
  await invalidate(queryKeys.sales);
  return result;
}

export async function addPurchasePayment(purchaseId: string, amount: number) {
  const result = await api.addPurchasePayment(purchaseId, amount);
  await invalidate(queryKeys.purchases);
  return result;
}

export async function addExpense(e: Omit<Expense, "id" | "date"> & { date?: string }) {
  const result = await api.addExpense(e);
  await invalidate(queryKeys.expenses);
  return result;
}

export async function deleteExpense(id: string) {
  await api.deleteExpense(id);
  await invalidate(queryKeys.expenses);
}

export async function recordPurchase(input: {
  company: string;
  code: string;
  qty: number;
  purchasePrice: number;
  sellPrice: number;
  paid: number;
  note?: string;
}) {
  const result = await api.recordPurchase(input);
  await invalidate(queryKeys.products, queryKeys.purchases);
  return result;
}

export async function recordSaleReturn(
  saleId: string,
  returnItems: { code: string; qty: number }[],
  reason: string,
) {
  const result = await api.recordSaleReturn({ saleId, returnItems, reason });
  await invalidate(queryKeys.products, queryKeys.sales, queryKeys.saleReturns);
  return result;
}

export async function recordPurchaseReturn(
  purchaseId: string,
  qty: number,
  reason: string,
) {
  const result = await api.recordPurchaseReturn({ purchaseId, qty, reason });
  await invalidate(queryKeys.products, queryKeys.purchases, queryKeys.purchaseReturns);
  return result;
}

export function useHydrated() {
  const [h, setH] = useState(false);
  useEffect(() => setH(true), []);
  return h;
}

export function useApiStatus() {
  const { isError, isSuccess } = useQuery({
    queryKey: ["health"],
    queryFn: api.health,
    retry: 2,
    refetchInterval: 30_000,
    enabled: typeof window !== "undefined",
  });
  return { connected: isSuccess, offline: isError };
}
