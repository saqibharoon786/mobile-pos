import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PosLayout } from "@/components/pos-layout";
import { useSales, useSaleReturns, recordSaleReturn, deleteSaleReturn, useHydrated } from "@/lib/pos-store";
import { Trash2, Undo2, X } from "lucide-react";

export const Route = createFileRoute("/sales-return")({
  head: () => ({
    meta: [
      { title: "Sales Return — Battery POS" },
      { name: "description", content: "Return items from a past sale." },
    ],
  }),
  component: SalesReturnPage,
});

function SalesReturnPage() {
  const sales = useSales();
  const returns = useSaleReturns();
  const hydrated = useHydrated();
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = sales.find((s) => s.id === activeId);

  return (
    <PosLayout>
      <div className="max-w-6xl">
        <h1 className="text-2xl font-semibold">Sales Return</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Customer se wapas aayi batteries — sale select karke return karain (stock wapas ajayega).
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="p-4 border-b border-border font-medium">Recent sales</div>
            {!hydrated ? null : sales.length === 0 ? (
              <div className="p-8 text-sm text-muted-foreground text-center">No sales</div>
            ) : (
              <div className="divide-y divide-border max-h-[500px] overflow-auto">
                {sales.slice(0, 30).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveId(s.id)}
                    className="w-full text-left p-3 hover:bg-muted/30 text-sm flex justify-between items-center"
                  >
                    <div>
                      <div className="font-medium">{s.id} · {s.customer || "—"}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(s.date).toLocaleDateString()} · {s.items.map((i) => `${i.code}×${i.qty}`).join(", ")}
                      </div>
                    </div>
                    <div className="text-xs">Rs {s.total.toFixed(0)}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="p-4 border-b border-border font-medium flex items-center gap-2">
              <Undo2 className="h-4 w-4" /> Return history {hydrated && `(${returns.length})`}
            </div>
            {!hydrated ? null : returns.length === 0 ? (
              <div className="p-8 text-sm text-muted-foreground text-center">No returns</div>
            ) : (
              <div className="divide-y divide-border max-h-[500px] overflow-auto">
                {returns.map((r) => (
                  <div key={r.id} className="p-3 text-sm">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="font-medium">{r.id} · {r.customer || "—"}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(r.date).toLocaleDateString()} · from {r.saleId} ·{" "}
                          {r.items.map((i) => `${i.code}×${i.qty}`).join(", ")}
                        </div>
                        {r.reason && <div className="text-xs italic text-muted-foreground mt-1">"{r.reason}"</div>}
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <div className="text-destructive">-Rs {r.total.toFixed(0)}</div>
                        <button
                          onClick={async () => {
                            if (!window.confirm(`Return ${r.id} delete kar dein?`)) return;
                            try {
                              await deleteSaleReturn(r.id);
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

      {active && <ReturnModal sale={active} onClose={() => setActiveId(null)} />}
    </PosLayout>
  );
}

function ReturnModal({ sale, onClose }: { sale: ReturnType<typeof useSales>[number]; onClose: () => void }) {
  const [qtys, setQtys] = useState<Record<string, string>>({});
  const [reason, setReason] = useState("");
  const [err, setErr] = useState("");

  async function submit() {
    setErr("");
    const items = Object.entries(qtys)
      .map(([code, q]) => ({ code, qty: Number(q) || 0 }))
      .filter((x) => x.qty > 0);
    if (items.length === 0) return setErr("Kam se kam 1 item ka qty likhain");
    try {
      await recordSaleReturn(sale.id, items, reason.trim());
      onClose();
    } catch (e) {
      setErr((e as Error).message);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <div className="font-semibold">Return from {sale.id}</div>
            <div className="text-xs text-muted-foreground">{sale.customer || "—"}</div>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-md hover:bg-accent inline-flex items-center justify-center">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-4 space-y-3">
          <div className="rounded-md border border-border divide-y divide-border">
            {sale.items.map((i) => {
              const already = sale.returnedQty?.[i.code] || 0;
              const remain = i.qty - already;
              return (
                <div key={i.code} className="p-3 flex items-center gap-3">
                  <div className="flex-1">
                    <div className="text-sm font-medium">{i.code}</div>
                    <div className="text-xs text-muted-foreground">
                      Sold {i.qty} · Returned {already} · Left {remain} · Rs {i.sellPrice}
                    </div>
                  </div>
                  <input
                    value={qtys[i.code] || ""}
                    onChange={(e) => setQtys({ ...qtys, [i.code]: e.target.value })}
                    inputMode="numeric"
                    placeholder="0"
                    disabled={remain <= 0}
                    className="w-20 h-9 px-2 rounded-md border border-input bg-background text-sm text-right disabled:opacity-40"
                  />
                </div>
              );
            })}
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Reason (optional)</label>
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. faulty, wrong item"
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
