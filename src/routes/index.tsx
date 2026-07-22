import { createFileRoute } from "@tanstack/react-router";
import { PosLayout } from "@/components/pos-layout";
import { useProducts, useSales, useExpenses, useHydrated } from "@/lib/pos-store";
import { Package, ShoppingCart, TrendingUp, Wallet, Receipt, PiggyBank } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Battery POS" },
      { name: "description", content: "Mobile battery shop POS management dashboard." },
    ],
  }),
  component: Index,
});

function Index() {
  const products = useProducts();
  const sales = useSales();
  const expenses = useExpenses();
  const hydrated = useHydrated();

  const totalProducts = products.length;
  const totalStock = products.reduce((s, p) => s + p.stock, 0);
  const totalRevenue = sales.reduce((s, x) => s + x.total, 0);
  const totalProfit = sales.reduce((s, x) => s + x.profit, 0);
  const totalSales = sales.length;
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const netProfit = totalProfit - totalExpenses;

  const stats = [
    { label: "Products", value: totalProducts, icon: Package },
    { label: "In stock", value: totalStock, icon: Package },
    { label: "Sales", value: totalSales, icon: ShoppingCart },
    { label: "Revenue", value: `Rs ${totalRevenue.toFixed(0)}`, icon: Wallet },
    { label: "Gross Profit", value: `Rs ${totalProfit.toFixed(0)}`, icon: TrendingUp },
    { label: "Expenses", value: `Rs ${totalExpenses.toFixed(0)}`, icon: Receipt },
    { label: "Net Profit", value: `Rs ${netProfit.toFixed(0)}`, icon: PiggyBank },
  ];

  return (
    <PosLayout>
      <div className="max-w-6xl">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of your mobile battery shop
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="mt-2 text-2xl font-semibold">
                  {hydrated ? s.value : "—"}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 rounded-xl border border-border bg-card">
          <div className="p-4 border-b border-border font-medium">Recent sales</div>
          {!hydrated || sales.length === 0 ? (
            <div className="p-8 text-sm text-muted-foreground text-center">
              No sales yet. Head over to POS to make your first sale.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {sales.slice(0, 8).map((s) => (
                <div key={s.id} className="p-4 flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium">{s.id}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(s.date).toLocaleString()} · {s.items.length} item(s)
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">Rs {s.total.toFixed(0)}</div>
                    <div className="text-xs text-emerald-600">
                      +Rs {s.profit.toFixed(0)} profit
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PosLayout>
  );
}
