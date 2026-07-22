import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5_000,
      retry: 1,
    },
  },
});

export const queryKeys = {
  products: ["products"] as const,
  sales: ["sales"] as const,
  purchases: ["purchases"] as const,
  expenses: ["expenses"] as const,
  saleReturns: ["saleReturns"] as const,
  purchaseReturns: ["purchaseReturns"] as const,
  ledgerCustomers: ["ledgerCustomers"] as const,
  ledgerEntries: ["ledgerEntries"] as const,
};

export async function invalidate(...keys: (readonly string[])[]) {
  await Promise.all(keys.map((key) => queryClient.invalidateQueries({ queryKey: key })));
}
