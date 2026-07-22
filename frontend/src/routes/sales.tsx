import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PosLayout } from "@/components/pos-layout";
import { useSales, deleteSale, useHydrated } from "@/lib/pos-store";
import { Receipt, Search, Trash2 } from "lucide-react";

export const Route = createFileRoute("/sales")({
  head: () => ({
    meta: [
      { title: "Sales History — Battery POS" },
      { name: "description", content: "Full sales history with payment status." },
    ],
  }),
  component: SalesPage,
});

function SalesPage() {
  const sales = useSales();
  const hydrated = useHydrated();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sales;
    return sales.filter((s) => {
      return (
        (s.customer || "").toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.items.some((i) => i.code.toLowerCase().includes(q))
      );
    });
  }, [sales, query]);

  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, s) => {
        acc.total += s.total;
        acc.paid += s.paid;
        acc.remaining += s.remaining;
        acc.profit += s.profit;
        return acc;
      },
      { total: 0, paid: 0, remaining: 0, profit: 0 },
    );
  }, [filtered]);

  return (
    <PosLayout>
      <div className="max-w-6xl">
        <h1 className="text-2xl font-semibold">Sales History</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Puri selling history — customer name se search karain.
        </p>

        <div className="mt-6 relative max-w-md">
          <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by customer, bill # or item code…"
            className="w-full h-10 pl-9 pr-3 rounded-md border border-input bg-background text-sm"
          />
        </div>

        {hydrated && query && (
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span>{filtered.length} sale(s)</span>
            <span>Total: <b className="text-foreground">Rs {totals.total.toFixed(0)}</b></span>
            <span>Paid: <b className="text-foreground">Rs {totals.paid.toFixed(0)}</b></span>
            <span>Remaining: <b className={totals.remaining > 0 ? "text-destructive" : "text-emerald-600"}>Rs {totals.remaining.toFixed(0)}</b></span>
            <span>Profit: <b className="text-emerald-600">Rs {totals.profit.toFixed(0)}</b></span>
          </div>
        )}

        <div className="mt-4 rounded-xl border border-border bg-card overflow-hidden">
          <div className="p-4 border-b border-border font-medium flex items-center gap-2">
            <Receipt className="h-4 w-4" /> All sales {hydrated && `(${filtered.length})`}
          </div>
          {!hydrated ? null : filtered.length === 0 ? (
            <div className="p-8 text-sm text-muted-foreground text-center">
              {query ? "Is customer/bill ka koi record nahi mila." : "Koi sale nahi. POS se sale karain."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground text-left">
                  <tr>
                    <th className="px-4 py-2 font-medium">Bill</th>
                    <th className="px-4 py-2 font-medium">Date</th>
                    <th className="px-4 py-2 font-medium">Customer</th>
                    <th className="px-4 py-2 font-medium">Items</th>
                    <th className="px-4 py-2 font-medium">Total</th>
                    <th className="px-4 py-2 font-medium">Paid</th>
                    <th className="px-4 py-2 font-medium">Remaining</th>
                    <th className="px-4 py-2 font-medium">Profit</th>
                    <th className="px-4 py-2 font-medium">Status</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((s) => {
                    const status =
                      s.paid <= 0
                        ? { label: "Not Paid", cls: "bg-destructive/10 text-destructive" }
                        : s.remaining > 0
                          ? { label: "Partial", cls: "bg-amber-500/10 text-amber-700 dark:text-amber-400" }
                          : { label: "Full Paid", cls: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" };
                    const hasReturns = s.returnedQty && Object.values(s.returnedQty).some((v) => v > 0);
                    return (
                      <tr key={s.id}>
                        <td className="px-4 py-2 font-medium">{s.id}</td>
                        <td className="px-4 py-2 text-muted-foreground">{new Date(s.date).toLocaleDateString()}</td>
                        <td className="px-4 py-2 font-medium whitespace-nowrap">{s.customer || "—"}</td>
                        <td className="px-4 py-2 text-xs">
                          {s.items.map((i) => `${i.code}×${i.qty}`).join(", ")}
                          {hasReturns && <span className="ml-1 text-amber-600">(returned)</span>}
                        </td>
                        <td className="px-4 py-2">Rs {s.total.toFixed(0)}</td>
                        <td className="px-4 py-2">Rs {s.paid.toFixed(0)}</td>
                        <td className={"px-4 py-2 " + (s.remaining > 0 ? "text-destructive" : "text-emerald-600")}>Rs {s.remaining.toFixed(0)}</td>
                        <td className="px-4 py-2 text-emerald-600">Rs {s.profit.toFixed(0)}</td>
                        <td className="px-4 py-2">
                          <span className={"inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium " + status.cls}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right">
                          <button
                            onClick={async () => {
                              if (!window.confirm(`Bill ${s.id} delete kar dein? Stock wapas ajayega.`)) return;
                              try {
                                await deleteSale(s.id);
                              } catch {
                                /* ignore */
                              }
                            }}
                            className="inline-flex items-center gap-1 text-xs text-destructive hover:underline"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PosLayout>
  );
}
