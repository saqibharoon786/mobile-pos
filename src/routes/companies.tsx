import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PosLayout } from "@/components/pos-layout";
import {
  usePurchases,
  useSales,
  useProducts,
  usePurchaseReturns,
  useHydrated,
} from "@/lib/pos-store";
import { Building2, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/companies")({
  head: () => ({
    meta: [
      { title: "Companies — Battery POS" },
      { name: "description", content: "Company-wise purchase and sales history." },
    ],
  }),
  component: CompaniesPage,
});

function CompaniesPage() {
  const purchases = usePurchases();
  const sales = useSales();
  const products = useProducts();
  const preturns = usePurchaseReturns();
  const hydrated = useHydrated();
  const [active, setActive] = useState<string | null>(null);

  const codeToCompany = useMemo(() => {
    const m = new Map<string, string>();
    products.forEach((p) => m.set(p.code, p.company));
    purchases.forEach((p) => { if (!m.has(p.code)) m.set(p.code, p.company); });
    return m;
  }, [products, purchases]);

  const companies = useMemo(() => {
    const map = new Map<string, {
      name: string;
      purchasedQty: number;
      purchasedAmt: number;
      paidAmt: number;
      remaining: number;
      returnedAmt: number;
      soldQty: number;
      soldAmt: number;
    }>();
    const ensure = (name: string) => {
      const key = name || "—";
      if (!map.has(key)) map.set(key, {
        name: key, purchasedQty: 0, purchasedAmt: 0, paidAmt: 0, remaining: 0,
        returnedAmt: 0, soldQty: 0, soldAmt: 0,
      });
      return map.get(key)!;
    };
    purchases.forEach((p) => {
      const c = ensure(p.company);
      c.purchasedQty += p.qty;
      c.purchasedAmt += p.total;
      c.paidAmt += p.paid;
      c.remaining += p.remaining;
    });
    preturns.forEach((r) => {
      const c = ensure(r.company);
      c.returnedAmt += r.total;
    });
    sales.forEach((s) => {
      s.items.forEach((i) => {
        const returned = s.returnedQty?.[i.code] || 0;
        const netQty = i.qty - returned;
        if (netQty <= 0) return;
        const comp = codeToCompany.get(i.code) || "—";
        const c = ensure(comp);
        c.soldQty += netQty;
        c.soldAmt += netQty * i.sellPrice;
      });
    });
    return Array.from(map.values()).sort((a, b) => b.purchasedAmt - a.purchasedAmt);
  }, [purchases, preturns, sales, codeToCompany]);

  const activeData = active ? companies.find((c) => c.name === active) : null;
  const activePurchases = active ? purchases.filter((p) => (p.company || "—") === active) : [];
  const activeSales = active
    ? sales
        .flatMap((s) =>
          s.items
            .filter((i) => (codeToCompany.get(i.code) || "—") === active)
            .map((i) => ({ sale: s, item: i })),
        )
    : [];

  return (
    <PosLayout>
      <div className="max-w-6xl">
        <h1 className="text-2xl font-semibold">Companies</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Har company se kitna uthaya, kitna becha, aur kitne paise dene hain.
        </p>

        <div className="mt-6 rounded-xl border border-border bg-card overflow-hidden">
          <div className="p-4 border-b border-border font-medium flex items-center gap-2">
            <Building2 className="h-4 w-4" /> All companies {hydrated && `(${companies.length})`}
          </div>
          {!hydrated ? null : companies.length === 0 ? (
            <div className="p-8 text-sm text-muted-foreground text-center">
              Koi company nahi. Purchases add karain.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground text-left">
                  <tr>
                    <th className="px-4 py-2 font-medium">Company</th>
                    <th className="px-4 py-2 font-medium">Purchased Qty</th>
                    <th className="px-4 py-2 font-medium">Purchased Amt</th>
                    <th className="px-4 py-2 font-medium">Paid</th>
                    <th className="px-4 py-2 font-medium">Remaining</th>
                    <th className="px-4 py-2 font-medium">Returned Amt</th>
                    <th className="px-4 py-2 font-medium">Sold Qty</th>
                    <th className="px-4 py-2 font-medium">Sold Amt</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {companies.map((c) => (
                    <tr key={c.name} className="hover:bg-muted/30 cursor-pointer" onClick={() => setActive(c.name)}>
                      <td className="px-4 py-2 font-medium">{c.name}</td>
                      <td className="px-4 py-2">{c.purchasedQty}</td>
                      <td className="px-4 py-2">Rs {c.purchasedAmt.toFixed(0)}</td>
                      <td className="px-4 py-2">Rs {c.paidAmt.toFixed(0)}</td>
                      <td className={"px-4 py-2 " + (c.remaining > 0 ? "text-destructive" : "text-emerald-600")}>
                        Rs {c.remaining.toFixed(0)}
                      </td>
                      <td className="px-4 py-2 text-muted-foreground">Rs {c.returnedAmt.toFixed(0)}</td>
                      <td className="px-4 py-2">{c.soldQty}</td>
                      <td className="px-4 py-2">Rs {c.soldAmt.toFixed(0)}</td>
                      <td className="px-4 py-2 text-right"><ChevronRight className="h-4 w-4 text-muted-foreground" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {active && activeData && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setActive(null)}>
          <div className="bg-card border border-border rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-border">
              <div className="font-semibold text-lg">{activeData.name}</div>
              <div className="text-sm text-muted-foreground mt-1">
                Purchased Rs {activeData.purchasedAmt.toFixed(0)} · Paid Rs {activeData.paidAmt.toFixed(0)} ·
                <span className={activeData.remaining > 0 ? " text-destructive" : " text-emerald-600"}> Remaining Rs {activeData.remaining.toFixed(0)}</span>
              </div>
            </div>
            <div className="p-4 overflow-auto space-y-6">
              <div>
                <div className="text-sm font-medium mb-2">Purchases ({activePurchases.length})</div>
                {activePurchases.length === 0 ? (
                  <div className="text-xs text-muted-foreground">No purchases</div>
                ) : (
                  <table className="w-full text-xs">
                    <thead className="text-muted-foreground text-left">
                      <tr><th className="py-1">Date</th><th>Code</th><th>Qty</th><th>Rate</th><th>Total</th><th>Paid</th><th>Remaining</th></tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {activePurchases.map((p) => (
                        <tr key={p.id}>
                          <td className="py-1 text-muted-foreground">{new Date(p.date).toLocaleDateString()}</td>
                          <td>{p.code}</td><td>{p.qty}</td><td>Rs {p.purchasePrice}</td>
                          <td>Rs {p.total.toFixed(0)}</td><td>Rs {p.paid.toFixed(0)}</td>
                          <td className={p.remaining > 0 ? "text-destructive" : "text-emerald-600"}>Rs {p.remaining.toFixed(0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              <div>
                <div className="text-sm font-medium mb-2">Sales of this company ({activeSales.length})</div>
                {activeSales.length === 0 ? (
                  <div className="text-xs text-muted-foreground">No sales</div>
                ) : (
                  <table className="w-full text-xs">
                    <thead className="text-muted-foreground text-left">
                      <tr><th className="py-1">Date</th><th>Bill</th><th>Customer</th><th>Code</th><th>Qty</th><th>Rate</th><th>Amt</th></tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {activeSales.map(({ sale, item }, idx) => (
                        <tr key={sale.id + item.code + idx}>
                          <td className="py-1 text-muted-foreground">{new Date(sale.date).toLocaleDateString()}</td>
                          <td>{sale.id}</td><td>{sale.customer || "—"}</td><td>{item.code}</td>
                          <td>{item.qty}</td><td>Rs {item.sellPrice}</td>
                          <td>Rs {(item.qty * item.sellPrice).toFixed(0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
            <div className="p-4 border-t border-border flex justify-end">
              <button onClick={() => setActive(null)} className="h-10 px-4 rounded-md border border-border text-sm">Close</button>
            </div>
          </div>
        </div>
      )}
    </PosLayout>
  );
}
