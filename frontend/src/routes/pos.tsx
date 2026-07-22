import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PosLayout } from "@/components/pos-layout";
import {
  useProducts,
  useSales,
  recordSale,
  addSalePayment,
  useHydrated,
  type Sale,
} from "@/lib/pos-store";
import { Plus, Minus, Trash2, Search, Printer, X, ShoppingCart, Wallet, Eye } from "lucide-react";


export const Route = createFileRoute("/pos")({
  head: () => ({
    meta: [
      { title: "POS — Sell — Gull House Battery" },
      { name: "description", content: "Sell mobile batteries with customer billing." },
    ],
  }),
  component: PosPage,
});

type CartLine = { code: string; qty: number };

const SHOP_NAME = "Gull House Battery";

function PosPage() {
  const products = useProducts();
  const sales = useSales();
  const hydrated = useHydrated();
  const [open, setOpen] = useState(false);
  const [receipt, setReceipt] = useState<Sale | null>(null);
  const [payFor, setPayFor] = useState<Sale | null>(null);
  const [viewSale, setViewSale] = useState<Sale | null>(null);
  const [query, setQuery] = useState("");

  const visibleSales = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? sales.filter(
          (s) =>
            (s.customer || "").toLowerCase().includes(q) ||
            s.id.toLowerCase().includes(q),
        )
      : sales;
    return base.slice(0, 20);
  }, [sales, query]);


  return (
    <PosLayout>
      <div className="max-w-6xl">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold">POS — Sell</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Naya sale banane ke liye "Add POS" par click karain.
            </p>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium inline-flex items-center gap-2 hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> Add POS
          </button>
        </div>

        <div className="mt-6 rounded-xl border border-border bg-card overflow-hidden">
          <div className="p-4 border-b border-border font-medium flex items-center gap-2 flex-wrap">
            <ShoppingCart className="h-4 w-4" />
            <span>Recent sales</span>
            <div className="ml-auto relative w-full sm:w-64">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search customer or bill…"
                className="w-full h-9 pl-9 pr-3 rounded-md border border-input bg-background text-sm font-normal"
              />
            </div>
          </div>
          {!hydrated ? null : visibleSales.length === 0 ? (
            <div className="p-8 text-sm text-muted-foreground text-center">
              {query ? "Koi match nahi mila." : "Koi sale nahi. \"Add POS\" se shuru karain."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr className="text-left">
                    <th className="px-4 py-2 font-medium">Bill</th>
                    <th className="px-4 py-2 font-medium">Customer</th>
                    <th className="px-4 py-2 font-medium">Items</th>
                    <th className="px-4 py-2 font-medium">Total</th>
                    <th className="px-4 py-2 font-medium">Paid</th>
                    <th className="px-4 py-2 font-medium">Remaining</th>
                    <th className="px-4 py-2 font-medium">Status</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {visibleSales.map((s) => {
                    const status =
                      s.paid <= 0
                        ? { label: "Not Paid", cls: "bg-destructive/10 text-destructive" }
                        : s.remaining > 0
                          ? { label: "Partial", cls: "bg-amber-500/10 text-amber-700 dark:text-amber-400" }
                          : { label: "Full Paid", cls: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" };
                    return (
                      <tr key={s.id}>
                        <td className="px-4 py-2 font-medium">{s.id}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{s.customer || "—"}</td>
                        <td className="px-4 py-2">
                          {s.items.map((i) => `${i.code}×${i.qty}`).join(", ")}
                        </td>
                        <td className="px-4 py-2">Rs {s.total.toFixed(0)}</td>
                        <td className="px-4 py-2">Rs {s.paid.toFixed(0)}</td>
                        <td className={"px-4 py-2 " + (s.remaining > 0 ? "text-destructive" : "text-emerald-600")}>
                          Rs {s.remaining.toFixed(0)}
                        </td>
                        <td className="px-4 py-2">
                          <span className={"inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium " + status.cls}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right">
                          <div className="inline-flex items-center gap-3 justify-end">
                            <button
                              onClick={() => setViewSale(s)}
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                              <Eye className="h-3.5 w-3.5" /> View
                            </button>
                            {s.remaining > 0 && (
                              <button
                                onClick={() => setPayFor(s)}
                                className="inline-flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400 hover:underline"
                              >
                                <Wallet className="h-3.5 w-3.5" /> Pay
                              </button>
                            )}
                            <button
                              onClick={() => setReceipt(s)}
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                              <Printer className="h-3.5 w-3.5" /> Print
                            </button>
                          </div>
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


      {open && (
        <PosForm
          onClose={() => setOpen(false)}
          onDone={(sale) => {
            setOpen(false);
            setReceipt(sale);
          }}
          products={products}
        />
      )}

      {receipt && (
        <ReceiptModal sale={receipt} onClose={() => setReceipt(null)} />
      )}

      {payFor && (
        <PayRemainingModal
          sale={payFor}
          onClose={() => setPayFor(null)}
        />
      )}

      {viewSale && (
        <ViewSaleModal sale={viewSale} onClose={() => setViewSale(null)} />
      )}
    </PosLayout>
  );
}

function ViewSaleModal({ sale, onClose }: { sale: Sale; onClose: () => void }) {
  const status =
    sale.paid <= 0
      ? { label: "Not Paid", cls: "bg-destructive/10 text-destructive" }
      : sale.remaining > 0
        ? { label: "Partial", cls: "bg-amber-500/10 text-amber-700 dark:text-amber-400" }
        : { label: "Full Paid", cls: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" };
  const returned = sale.returnedQty || {};
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-xl w-full max-w-lg max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="font-semibold">Sale details</div>
          <button onClick={onClose} className="h-8 w-8 rounded-md hover:bg-accent inline-flex items-center justify-center">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-4 space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-muted-foreground">Bill</div>
              <div className="font-medium">{sale.id}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Date</div>
              <div className="font-medium">{new Date(sale.date).toLocaleString()}</div>
            </div>
            <div className="col-span-2">
              <div className="text-xs text-muted-foreground">Customer</div>
              <div className="font-medium">{sale.customer || "—"}</div>
            </div>
          </div>

          <div className="rounded-md border border-border overflow-hidden">
            <div className="px-3 py-2 bg-muted/50 text-xs font-medium text-muted-foreground">Items</div>
            <div className="divide-y divide-border">
              {sale.items.map((i) => {
                const ret = returned[i.code] || 0;
                return (
                  <div key={i.code} className="p-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium">{i.code}</div>
                      <div className="text-xs text-muted-foreground">
                        Rs {i.sellPrice} × {i.qty}
                        {ret > 0 && <span className="ml-1 text-amber-600">(returned {ret})</span>}
                      </div>
                    </div>
                    <div className="font-medium">Rs {(i.sellPrice * i.qty).toFixed(0)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-md border border-border p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-semibold">Rs {sale.total.toFixed(0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Paid</span>
              <span className="text-emerald-600 font-medium">Rs {sale.paid.toFixed(0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Remaining</span>
              <span className={"font-semibold " + (sale.remaining > 0 ? "text-destructive" : "text-emerald-600")}>
                Rs {sale.remaining.toFixed(0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Profit</span>
              <span className="text-emerald-600">Rs {sale.profit.toFixed(0)}</span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-muted-foreground">Status</span>
              <span className={"inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium " + status.cls}>
                {status.label}
              </span>
            </div>
          </div>

          <div className="rounded-md border border-border overflow-hidden">
            <div className="px-3 py-2 bg-muted/50 text-xs font-medium text-muted-foreground flex items-center justify-between">
              <span>Payment history</span>
              <span>{(sale.payments?.length || 0)} entries</span>
            </div>
            {(!sale.payments || sale.payments.length === 0) ? (
              <div className="p-3 text-xs text-muted-foreground text-center">
                Abhi tak koi payment nahi hui.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {sale.payments.map((p, i) => (
                  <div key={i} className="p-3 flex items-center justify-between text-sm">
                    <div>
                      <div className="font-medium">{new Date(p.date).toLocaleDateString()}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(p.date).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="font-semibold text-emerald-600">Rs {p.amount.toFixed(0)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
        <div className="p-4 border-t border-border flex items-center justify-end">
          <button onClick={onClose} className="h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}


function PayRemainingModal({ sale, onClose }: { sale: Sale; onClose: () => void }) {
  const [amount, setAmount] = useState(String(sale.remaining));
  const [err, setErr] = useState("");

  async function submit(full: boolean) {
    setErr("");
    const amt = full ? sale.remaining : Number(amount);
    if (!amt || amt <= 0) return setErr("Amount likhain");
    try {
      await addSalePayment(sale.id, amt);
      onClose();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Error");
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="font-semibold">Remaining amount receive karain</div>
          <button onClick={onClose} className="h-8 w-8 rounded-md hover:bg-accent inline-flex items-center justify-center">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-4 space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Bill</span>
            <span className="font-medium">{sale.id}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Customer</span>
            <span>{sale.customer || "—"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Total</span>
            <span>Rs {sale.total.toFixed(0)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Paid</span>
            <span>Rs {sale.paid.toFixed(0)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Remaining</span>
            <span className="font-semibold text-destructive">Rs {sale.remaining.toFixed(0)}</span>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Amount receive</label>
            <input
              autoFocus
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="decimal"
              className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
            />
          </div>
          {err && <div className="text-sm text-destructive">{err}</div>}
        </div>
        <div className="p-4 border-t border-border flex items-center justify-end gap-2">
          <button onClick={onClose} className="h-10 px-4 rounded-md border border-border text-sm">
            Cancel
          </button>
          <button
            onClick={() => submit(true)}
            className="h-10 px-4 rounded-md border border-border text-sm"
          >
            Full Pay
          </button>
          <button
            onClick={() => submit(false)}
            className="h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium"
          >
            Receive
          </button>
        </div>
      </div>
    </div>
  );
}


function PosForm({
  onClose,
  onDone,
  products,
}: {
  onClose: () => void;
  onDone: (s: Sale) => void;
  products: ReturnType<typeof useProducts>;
}) {
  const [customer, setCustomer] = useState("");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [paid, setPaid] = useState("");
  const [err, setErr] = useState("");

  const filtered = useMemo(
    () => {
      const q = query.trim().toLowerCase();
      return products.filter(
        (p) =>
          p.code.toLowerCase().includes(q) ||
          (p.company || "").toLowerCase().includes(q),
      );
    },
    [products, query],
  );

  const lines = cart
    .map((c) => {
      const p = products.find((x) => x.code === c.code);
      if (!p) return null;
      return {
        code: p.code,
        qty: c.qty,
        sellPrice: p.sellPrice,
        purchasePrice: p.purchasePrice,
        stock: p.stock,
        subtotal: p.sellPrice * c.qty,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const total = lines.reduce((s, l) => s + l.subtotal, 0);
  const paidNum = Number(paid) || 0;
  const remaining = Math.max(0, total - paidNum);

  function add(code: string) {
    setCart((c) => {
      const idx = c.findIndex((x) => x.code === code);
      if (idx >= 0) {
        const copy = [...c];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + 1 };
        return copy;
      }
      return [...c, { code, qty: 1 }];
    });
  }
  function dec(code: string) {
    setCart((c) =>
      c
        .map((x) => (x.code === code ? { ...x, qty: x.qty - 1 } : x))
        .filter((x) => x.qty > 0),
    );
  }
  function remove(code: string) {
    setCart((c) => c.filter((x) => x.code !== code));
  }

  async function submit() {
    setErr("");
    if (!customer.trim()) return setErr("Customer name likhain");
    if (lines.length === 0) return setErr("Koi item add karain");
    try {
      const sale = await recordSale(
        lines.map((l) => ({
          code: l.code,
          qty: l.qty,
          sellPrice: l.sellPrice,
          purchasePrice: l.purchasePrice,
        })),
        { customer: customer.trim(), paid: paidNum },
      );
      onDone(sale);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Error");
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="font-semibold">New Sale</div>
          <button onClick={onClose} className="h-8 w-8 rounded-md hover:bg-accent inline-flex items-center justify-center">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-auto">
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Customer name</label>
              <input
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                placeholder="e.g. Ali Khan"
                className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground">Add batteries</label>
              <div className="mt-1 relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search code (bg-6, bg-9…)"
                  className="w-full h-10 pl-9 pr-3 rounded-md border border-input bg-background text-sm"
                />
              </div>
              <div className="mt-2 max-h-60 overflow-auto grid grid-cols-2 gap-2">
                {filtered.length === 0 ? (
                  <div className="col-span-full text-xs text-muted-foreground text-center py-6 border border-dashed border-border rounded-md">
                    No products
                  </div>
                ) : (
                  filtered.map((p) => (
                    <button
                      key={p.code}
                      onClick={() => add(p.code)}
                      disabled={p.stock <= 0}
                      className="text-left rounded-md border border-border bg-background p-2 hover:border-primary disabled:opacity-50"
                    >
                      <div className="font-medium text-sm">
                        {p.code} {p.company && <span className="text-muted-foreground font-normal">— {p.company}</span>}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Rs {p.sellPrice} · {p.stock} available
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-md border border-border">
              <div className="p-3 border-b border-border text-sm font-medium">Items</div>
              {lines.length === 0 ? (
                <div className="p-4 text-xs text-muted-foreground text-center">Cart empty</div>
              ) : (
                <div className="divide-y divide-border">
                  {lines.map((l) => (
                    <div key={l.code} className="p-2 flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{l.code}</div>
                        <div className="text-xs text-muted-foreground">
                          Rs {l.sellPrice} × {l.qty} = Rs {l.subtotal}
                        </div>
                      </div>
                      <button onClick={() => dec(l.code)} className="h-7 w-7 rounded-md border border-border inline-flex items-center justify-center">
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center text-sm">{l.qty}</span>
                      <button
                        onClick={() => add(l.code)}
                        disabled={l.qty >= l.stock}
                        className="h-7 w-7 rounded-md border border-border inline-flex items-center justify-center disabled:opacity-40"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <button onClick={() => remove(l.code)} className="h-7 w-7 rounded-md text-destructive inline-flex items-center justify-center">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-md border border-border p-3 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="font-semibold">Rs {total.toFixed(0)}</span>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Paid amount</label>
                <input
                  value={paid}
                  onChange={(e) => setPaid(e.target.value)}
                  inputMode="decimal"
                  placeholder="0"
                  className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Remaining</span>
                <span className={"font-semibold " + (remaining > 0 ? "text-destructive" : "text-emerald-600")}>
                  Rs {remaining.toFixed(0)}
                </span>
              </div>
            </div>

            {err && <div className="text-sm text-destructive">{err}</div>}
          </div>
        </div>

        <div className="p-4 border-t border-border flex items-center justify-end gap-2">
          <button onClick={onClose} className="h-10 px-4 rounded-md border border-border text-sm">
            Cancel
          </button>
          <button
            onClick={submit}
            className="h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium inline-flex items-center gap-2 hover:bg-primary/90"
          >
            <Printer className="h-4 w-4" /> Save & Print
          </button>
        </div>
      </div>
    </div>
  );
}

function ReceiptModal({ sale, onClose }: { sale: Sale; onClose: () => void }) {
  function doPrint() {
    const w = window.open("", "_blank", "width=380,height=600");
    if (!w) return;
    const rows = sale.items
      .map(
        (i) =>
          `<tr><td>${escapeHtml(i.code)}</td><td style="text-align:center">${i.qty}</td><td style="text-align:right">${i.sellPrice}</td><td style="text-align:right">${i.sellPrice * i.qty}</td></tr>`,
      )
      .join("");
    w.document.write(`<!doctype html><html><head><title>${SHOP_NAME} — ${sale.id}</title>
<style>
  *{box-sizing:border-box}
  body{font-family:ui-monospace,Menlo,Consolas,monospace;padding:16px;color:#000;font-size:12px}
  h1{font-size:18px;text-align:center;margin:0 0 4px}
  .sub{text-align:center;font-size:11px;margin-bottom:12px}
  table{width:100%;border-collapse:collapse;margin-top:8px}
  th,td{padding:4px 2px;border-bottom:1px dashed #999;font-size:12px}
  th{text-align:left;font-weight:600}
  .row{display:flex;justify-content:space-between;margin-top:4px}
  .tot{font-weight:700;font-size:14px;border-top:1px solid #000;padding-top:6px;margin-top:8px}
  .foot{text-align:center;margin-top:14px;font-size:11px}
</style></head><body>
<h1>${SHOP_NAME}</h1>
<div class="sub">Mobile Battery Sale Receipt</div>
<div class="row"><span>Bill:</span><span>${sale.id}</span></div>
<div class="row"><span>Date:</span><span>${new Date(sale.date).toLocaleString()}</span></div>
<div class="row"><span>Customer:</span><span>${escapeHtml(sale.customer || "-")}</span></div>
<table>
<thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Rate</th><th style="text-align:right">Amt</th></tr></thead>
<tbody>${rows}</tbody>
</table>
<div class="row tot"><span>Total</span><span>Rs ${sale.total.toFixed(0)}</span></div>
<div class="row"><span>Paid</span><span>Rs ${sale.paid.toFixed(0)}</span></div>
<div class="row"><span>Remaining</span><span>Rs ${sale.remaining.toFixed(0)}</span></div>
<div class="foot">Shukriya! — ${SHOP_NAME}</div>
<script>window.onload=()=>{window.print();}</script>
</body></html>`);
    w.document.close();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white text-black rounded-xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
          <div className="font-semibold">Receipt</div>
          <button onClick={onClose} className="h-8 w-8 rounded-md hover:bg-neutral-100 inline-flex items-center justify-center">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-4 font-mono text-xs">
          <div className="text-center text-lg font-bold">{SHOP_NAME}</div>
          <div className="text-center text-[11px] mb-3">Mobile Battery Sale Receipt</div>
          <div className="flex justify-between"><span>Bill:</span><span>{sale.id}</span></div>
          <div className="flex justify-between"><span>Date:</span><span>{new Date(sale.date).toLocaleString()}</span></div>
          <div className="flex justify-between"><span>Customer:</span><span>{sale.customer || "-"}</span></div>
          <table className="w-full mt-2">
            <thead>
              <tr className="border-b border-dashed border-neutral-400">
                <th className="text-left py-1">Item</th>
                <th className="text-center">Qty</th>
                <th className="text-right">Rate</th>
                <th className="text-right">Amt</th>
              </tr>
            </thead>
            <tbody>
              {sale.items.map((i) => (
                <tr key={i.code} className="border-b border-dashed border-neutral-300">
                  <td className="py-1">{i.code}</td>
                  <td className="text-center">{i.qty}</td>
                  <td className="text-right">{i.sellPrice}</td>
                  <td className="text-right">{i.sellPrice * i.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-between font-bold border-t border-black mt-2 pt-1"><span>Total</span><span>Rs {sale.total.toFixed(0)}</span></div>
          <div className="flex justify-between"><span>Paid</span><span>Rs {sale.paid.toFixed(0)}</span></div>
          <div className="flex justify-between"><span>Remaining</span><span>Rs {sale.remaining.toFixed(0)}</span></div>
          <div className="text-center mt-3">Shukriya! — {SHOP_NAME}</div>
        </div>
        <div className="p-3 border-t border-neutral-200 flex justify-end gap-2">
          <button onClick={onClose} className="h-9 px-3 rounded-md border border-neutral-300 text-sm">Close</button>
          <button onClick={doPrint} className="h-9 px-3 rounded-md bg-black text-white text-sm inline-flex items-center gap-2">
            <Printer className="h-4 w-4" /> Print
          </button>
        </div>
      </div>
    </div>
  );
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    c === "&" ? "&amp;" : c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === '"' ? "&quot;" : "&#39;",
  );
}