import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PosLayout } from "@/components/pos-layout";
import {
  usePurchases,
  useProducts,
  recordPurchase,
  deletePurchase,
  useHydrated,
} from "@/lib/pos-store";
import { Plus, Trash2, Truck, X } from "lucide-react";

export const Route = createFileRoute("/purchases")({
  head: () => ({
    meta: [
      { title: "Purchases — Battery POS" },
      { name: "description", content: "Stock purchases from companies." },
    ],
  }),
  component: PurchasesPage,
});

function PurchasesPage() {
  const purchases = usePurchases();
  const hydrated = useHydrated();
  const [open, setOpen] = useState(false);

  return (
    <PosLayout>
      <div className="max-w-6xl">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Purchasing History</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Kis company se kitna maal uthaya — record here.
            </p>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium inline-flex items-center gap-2 hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> Add Purchase
          </button>
        </div>

        <div className="mt-6 rounded-xl border border-border bg-card overflow-hidden">
          <div className="p-4 border-b border-border font-medium flex items-center gap-2">
            <Truck className="h-4 w-4" /> All purchases {hydrated && `(${purchases.length})`}
          </div>
          {!hydrated ? null : purchases.length === 0 ? (
            <div className="p-8 text-sm text-muted-foreground text-center">
              Koi purchase nahi. "Add Purchase" se shuru karain.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground text-left">
                  <tr>
                    <th className="px-4 py-2 font-medium">Date</th>
                    <th className="px-4 py-2 font-medium">Company</th>
                    <th className="px-4 py-2 font-medium">Code</th>
                    <th className="px-4 py-2 font-medium">Qty</th>
                    <th className="px-4 py-2 font-medium">Rate</th>
                    <th className="px-4 py-2 font-medium">Total</th>
                    <th className="px-4 py-2 font-medium">Paid</th>
                    <th className="px-4 py-2 font-medium">Remaining</th>
                    <th className="px-4 py-2 font-medium">Returned</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {purchases.map((p) => (
                    <tr key={p.id}>
                      <td className="px-4 py-2 text-muted-foreground">
                        {new Date(p.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 font-medium">{p.company}</td>
                      <td className="px-4 py-2">{p.code}</td>
                      <td className="px-4 py-2">{p.qty}</td>
                      <td className="px-4 py-2">Rs {p.purchasePrice}</td>
                      <td className="px-4 py-2">Rs {p.total.toFixed(0)}</td>
                      <td className="px-4 py-2">Rs {p.paid.toFixed(0)}</td>
                      <td className={"px-4 py-2 " + (p.remaining > 0 ? "text-destructive" : "text-emerald-600")}>
                        Rs {p.remaining.toFixed(0)}
                      </td>
                      <td className="px-4 py-2 text-muted-foreground">{p.returnedQty || 0}</td>
                      <td className="px-4 py-2 text-right">
                        <button
                          onClick={async () => {
                            if (!window.confirm(`${p.company} · ${p.code} ki purchase delete kar dein?`)) return;
                            try {
                              await deletePurchase(p.id);
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
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {open && <PurchaseForm onClose={() => setOpen(false)} />}
    </PosLayout>
  );
}

function PurchaseForm({ onClose }: { onClose: () => void }) {
  const products = useProducts();
  const [company, setCompany] = useState("");
  const [code, setCode] = useState("");
  const [qty, setQty] = useState("");
  const [purchase, setPurchase] = useState("");
  const [sell, setSell] = useState("");
  const [paid, setPaid] = useState("");
  const [note, setNote] = useState("");
  const [err, setErr] = useState("");

  function pickProduct(c: string) {
    setCode(c);
    const p = products.find((x) => x.code === c);
    if (p) {
      setCompany(p.company);
      setPurchase(String(p.purchasePrice));
      setSell(String(p.sellPrice));
    }
  }

  async function submit() {
    setErr("");
    if (!company.trim()) return setErr("Company likhain");
    if (!code.trim()) return setErr("Code likhain");
    const q = Number(qty), pp = Number(purchase), sp = Number(sell), pd = Number(paid || "0");
    if (!Number.isFinite(q) || q <= 0) return setErr("Qty valid ho");
    if (!Number.isFinite(pp) || pp < 0) return setErr("Purchase price valid ho");
    if (!Number.isFinite(sp) || sp < 0) return setErr("Sell price valid ho");
    try {
      await recordPurchase({
        company: company.trim(),
        code: code.trim(),
        qty: q,
        purchasePrice: pp,
        sellPrice: sp,
        paid: pd,
        note: note.trim(),
      });
      onClose();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Error");
    }
  }

  const total = (Number(qty) || 0) * (Number(purchase) || 0);
  const remaining = Math.max(0, total - (Number(paid) || 0));

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="font-semibold">New Purchase</div>
          <button onClick={onClose} className="h-8 w-8 rounded-md hover:bg-accent inline-flex items-center justify-center">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-4 grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="text-xs text-muted-foreground">Company</label>
            <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="ABC Company"
              className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Code</label>
            <input value={code} onChange={(e) => pickProduct(e.target.value)} list="product-codes" placeholder="bg-5"
              className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm" />
            <datalist id="product-codes">
              {products.map((p) => <option key={p.code} value={p.code}>{p.company}</option>)}
            </datalist>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Qty</label>
            <input value={qty} onChange={(e) => setQty(e.target.value)} inputMode="numeric" placeholder="10"
              className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Purchase Rs</label>
            <input value={purchase} onChange={(e) => setPurchase(e.target.value)} inputMode="decimal" placeholder="500"
              className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Selling Rs</label>
            <input value={sell} onChange={(e) => setSell(e.target.value)} inputMode="decimal" placeholder="700"
              className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Paid to company</label>
            <input value={paid} onChange={(e) => setPaid(e.target.value)} inputMode="decimal" placeholder="0"
              className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Remaining</label>
            <div className={"mt-1 w-full h-10 px-3 rounded-md border border-input bg-muted/40 text-sm inline-flex items-center " + (remaining > 0 ? "text-destructive" : "text-emerald-600")}>
              Rs {remaining.toFixed(0)}
            </div>
          </div>
          <div className="col-span-2">
            <label className="text-xs text-muted-foreground">Note</label>
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional"
              className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm" />
          </div>
          {err && <div className="col-span-2 text-sm text-destructive">{err}</div>}
        </div>
        <div className="p-4 border-t border-border flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Total: <span className="text-foreground font-semibold">Rs {total.toFixed(0)}</span></div>
          <div className="flex gap-2">
            <button onClick={onClose} className="h-10 px-4 rounded-md border border-border text-sm">Cancel</button>
            <button onClick={submit} className="h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium">Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}
