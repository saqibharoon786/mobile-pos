import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PosLayout } from "@/components/pos-layout";
import { usePurchases, usePurchaseReturns, recordPurchaseReturn, deletePurchaseReturn, useHydrated } from "@/lib/pos-store";
import type { Purchase } from "@/lib/pos-types";
import { RotateCcw, Search, Trash2, X } from "lucide-react";

export const Route = createFileRoute("/pop-return")({
  head: () => ({
    meta: [
      { title: "POP Return — Battery POS" },
      { name: "description", content: "Return stock back to a company." },
    ],
  }),
  component: PopReturnPage,
});

function returnableQty(p: Purchase) {
  return p.qty - (p.returnedQty || 0);
}

function PopReturnPage() {
  const purchases = usePurchases();
  const returns = usePurchaseReturns();
  const hydrated = useHydrated();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const active = purchases.find((p) => p.id === activeId);

  const filteredPurchases = useMemo(() => {
    const q = search.trim().toLowerCase();
    return purchases
      .filter((p) => {
        const remain = returnableQty(p);
        if (!showAll && remain <= 0) return false;
        if (!q) return true;
        return (
          p.company.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          new Date(p.date).toLocaleDateString().toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const ra = returnableQty(a);
        const rb = returnableQty(b);
        if (ra > 0 && rb <= 0) return -1;
        if (ra <= 0 && rb > 0) return 1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
  }, [purchases, search, showAll]);

  const returnableCount = purchases.filter((p) => returnableQty(p) > 0).length;

  return (
    <PosLayout>
      <div className="max-w-6xl">
        <h1 className="text-2xl font-semibold">POP Return</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Company ko wapas bhejni hain batteries — purchase select karke return karain (stock kam ho jayega).
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="p-4 border-b border-border space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="font-medium">
                  Purchases {hydrated && `(${returnableCount} returnable)`}
                </div>
                <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={showAll}
                    onChange={(e) => setShowAll(e.target.checked)}
                    className="rounded border-input"
                  />
                  Sab dikhao
                </label>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Company, code, ID ya date se search…"
                  className="w-full h-9 pl-9 pr-3 rounded-md border border-input bg-background text-sm"
                />
              </div>
            </div>
            {!hydrated ? null : filteredPurchases.length === 0 ? (
              <div className="p-8 text-sm text-muted-foreground text-center">
                {purchases.length === 0 ? "No purchases" : "Koi purchase match nahi hui"}
              </div>
            ) : (
              <div className="divide-y divide-border max-h-[500px] overflow-auto">
                {filteredPurchases.map((p) => {
                  const remain = returnableQty(p);
                  return (
                    <button
                      key={p.id}
                      onClick={() => setActiveId(p.id)}
                      disabled={remain <= 0}
                      className="w-full text-left p-3 hover:bg-muted/30 text-sm flex justify-between items-center disabled:opacity-40"
                    >
                      <div>
                        <div className="font-medium">{p.company} · {p.code}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(p.date).toLocaleDateString()} · {p.id} · Qty {p.qty} · Returnable {remain}
                        </div>
                      </div>
                      <div className="text-xs shrink-0 ml-2">Rs {p.total.toFixed(0)}</div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="p-4 border-b border-border font-medium flex items-center gap-2">
              <RotateCcw className="h-4 w-4" /> Return history {hydrated && `(${returns.length})`}
            </div>
            {!hydrated ? null : returns.length === 0 ? (
              <div className="p-8 text-sm text-muted-foreground text-center">No returns</div>
            ) : (
              <div className="divide-y divide-border max-h-[500px] overflow-auto">
                {returns.map((r) => (
                  <div key={r.id} className="p-3 text-sm">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="font-medium">{r.company} · {r.code}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(r.date).toLocaleDateString()} · Qty {r.qty} · from {r.purchaseId}
                        </div>
                        {r.reason && <div className="text-xs italic text-muted-foreground mt-1">"{r.reason}"</div>}
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <div className="text-emerald-600">-Rs {r.total.toFixed(0)}</div>
                        <button
                          onClick={async () => {
                            if (!window.confirm(`Return ${r.id} delete kar dein?`)) return;
                            try {
                              await deletePurchaseReturn(r.id);
                            } catch {
                              /* ignore */
                            }
                          }}
                          className="inline-flex items-center gap-1 text-xs text-destructive hover:underline"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {active && <ReturnModal purchase={active} onClose={() => setActiveId(null)} />}
    </PosLayout>
  );
}

function ReturnModal({ purchase, onClose }: { purchase: Purchase; onClose: () => void }) {
  const remain = returnableQty(purchase);
  const [qty, setQty] = useState(String(remain));
  const [reason, setReason] = useState("");
  const [err, setErr] = useState("");

  async function submit() {
    setErr("");
    const q = Number(qty);
    if (!Number.isFinite(q) || q <= 0) return setErr("Qty valid ho");
    if (q > remain) return setErr(`Max ${remain} return ho sakti hain`);
    try {
      await recordPurchaseReturn(purchase.id, q, reason.trim());
      onClose();
    } catch (e) {
      setErr((e as Error).message);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <div className="font-semibold">Return to {purchase.company}</div>
            <div className="text-xs text-muted-foreground">
              {purchase.code} · {purchase.id} · {new Date(purchase.date).toLocaleDateString()}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Rs {purchase.purchasePrice} each · {remain} available
            </div>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-md hover:bg-accent inline-flex items-center justify-center">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">Qty to return</label>
            <input
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              inputMode="numeric"
              placeholder="1"
              className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Reason (optional)</label>
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. defective batch"
              className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
            />
          </div>
          {err && <div className="text-sm text-destructive">{err}</div>}
        </div>
        <div className="p-4 border-t border-border flex justify-end gap-2">
          <button onClick={onClose} className="h-10 px-4 rounded-md border border-border text-sm">Cancel</button>
          <button onClick={submit} className="h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium">
            Confirm Return
          </button>
        </div>
      </div>
    </div>
  );
}
