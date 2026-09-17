import { createFileRoute } from "@tanstack/react-router";
import { PosLayout } from "@/components/pos-layout";
import { useProducts, useSales, useExpenses, useRepairCustomers, useHydrated } from "@/lib/pos-store";
import { Package, ShoppingCart, TrendingUp, Wallet, Receipt, PiggyBank, Wrench } from "lucide-react";

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
  const repairCustomers = useRepairCustomers();
  const hydrated = useHydrated();

  const repairRevenue = repairCustomers.reduce(
    (sum, customer) => sum + customer.visits.reduce((vSum, visit) => vSum + visit.soldPrice, 0),
    0,
  );
  const repairProfit = repairCustomers.reduce(
    (sum, customer) =>
      sum +
      customer.visits.reduce(
        (vSum, visit) => vSum + (visit.soldPrice - visit.purchasePrice * visit.qty),
        0,
      ),
    0,
  );
  const repairVisits = repairCustomers.reduce((sum, customer) => sum + customer.visits.length, 0);

  const totalProducts = products.length;
  const totalStock = products.reduce((s, p) => s + p.stock, 0);
  const totalRevenue = sales.reduce((s, x) => s + x.total, 0) + repairRevenue;
  const totalProfit = sales.reduce((s, x) => s + x.profit, 0) + repairProfit;
  const totalSales = sales.length + repairVisits;
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const netProfit = totalProfit - totalExpenses;

  const stats = [
    { label: "Products", value: totalProducts, icon: Package },
    { label: "In stock", value: totalStock, icon: Package },
    { label: "Sales + Repairs", value: totalSales, icon: ShoppingCart },
    { label: "Revenue", value: `Rs ${totalRevenue.toFixed(0)}`, icon: Wallet },
    { label: "Gross Profit", value: `Rs ${totalProfit.toFixed(0)}`, icon: TrendingUp },
    { label: "Repair Visits", value: repairVisits, icon: Wrench },
    { label: "Expenses", value: `Rs ${totalExpenses.toFixed(0)}`, icon: Receipt },
    { label: "Net Profit", value: `Rs ${netProfit.toFixed(0)}`, icon: PiggyBank },
  ];

  const recentRepairVisits = repairCustomers
    .flatMap((customer) =>
      customer.visits.map((visit) => ({
        id: visit.id,
        customerName: customer.customerName,
        itemName: visit.itemName,
        soldPrice: visit.soldPrice,
        date: visit.date,
      })),
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <PosLayout>
      <div className="max-w-6xl">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of your mobile battery shop — POS sales aur repair customers dono shamil
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

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-border bg-card">
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

          <div className="rounded-xl border border-border bg-card">
            <div className="p-4 border-b border-border font-medium">Recent repair visits</div>
            {!hydrated || recentRepairVisits.length === 0 ? (
              <div className="p-8 text-sm text-muted-foreground text-center">
                No repair visits yet.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {recentRepairVisits.map((visit) => (
                  <div key={visit.id} className="p-4 flex items-center justify-between text-sm">
                    <div>
                      <div className="font-medium">{visit.customerName}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(visit.date).toLocaleString()} · {visit.itemName}
                      </div>
                    </div>
                    <div className="text-right font-medium">Rs {visit.soldPrice.toFixed(0)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PosLayout>
  );
}
