import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PosLayout } from "@/components/pos-layout";
import {
  useLedgerCustomers,
  useLedgerEntries,
  useProducts,
  useHydrated,
  addLedgerCustomer,
  addLedgerSale,
  addLedgerPayment,
  addLedgerDirectBill,
  deleteLedgerCustomer,
  deleteLedgerEntry,
  type LedgerCustomer,
  type LedgerEntry,
  type LedgerSaleItem,
} from "@/lib/pos-store";
import {
  BookUser,
  Plus,
  Search,
  X,
  Wallet,
  ShoppingCart,
  Trash2,
  Eye,
  Minus,
} from "lucide-react";

export const Route = createFileRoute("/ledger")({
  head: () => ({
    meta: [
      { title: "Ledger (Khata) — Battery POS" },
      { name: "description", content: "Customer ledger — bills and payments date-wise." },
    ],
  }),
  component: LedgerPage,
});

function todayInput() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function LedgerPage() {
  const customers = useLedgerCustomers();
  const entries = useLedgerEntries();
  const hydrated = useHydrated();
  const [addOpen, setAddOpen] = useState(false);
  const [openCustomer, setOpenCustomer] = useState<LedgerCustomer | null>(null);
  const [payCustomer, setPayCustomer] = useState<LedgerCustomer | null>(null);
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    return customers.map((c) => {
      const es = entries.filter((e) => e.customerId === c.id);
      const totalBill = es.reduce((s, e) => (e.kind === "sale" ? s + e.total : s), 0);
      const totalPaid = es.reduce((s, e) => (e.kind === "payment" ? s + e.amount : s), 0);
      const remaining = Math.max(0, totalBill - totalPaid);
      const last = es[0]?.date;
      return { c, totalBill, totalPaid, remaining, last, count: es.length };
    });
  }, [customers, entries]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => r.c.name.toLowerCase().includes(q));
  }, [rows, query]);

  const grand = useMemo(
    () =>
      rows.reduce(
        (a, r) => {
          a.bill += r.totalBill;
          a.paid += r.totalPaid;
          a.remaining += r.remaining;
          return a;
        },
        { bill: 0, paid: 0, remaining: 0 },
      ),
    [rows],
  );

  return (
    <PosLayout>
      <div className="max-w-6xl">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold">Ledger (Khata)</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Customer wise udhar aur payments. Dashboard/profit se alag.
            </p>
          </div>
          <button
            onClick={() => setAddOpen(true)}
            className="h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium inline-flex items-center gap-2 hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> Naya Customer
          </button>
        </div>

        {hydrated && customers.length > 0 && (
          <div className="mt-6 grid grid-cols-3 gap-4">
            <StatCard label="Total Bill" value={`Rs ${grand.bill.toFixed(0)}`} />
            <StatCard label="Total Paid" value={`Rs ${grand.paid.toFixed(0)}`} tone="ok" />
            <StatCard label="Remaining" value={`Rs ${grand.remaining.toFixed(0)}`} tone={grand.remaining > 0 ? "bad" : "ok"} />
          </div>
        )}

        <div className="mt-6 rounded-xl border border-border bg-card overflow-hidden">
          <div className="p-4 border-b border-border font-medium flex items-center gap-2 flex-wrap">
            <BookUser className="h-4 w-4" />
            <span>Customers</span>
            <div className="ml-auto relative w-full sm:w-64">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search customer…"
                className="w-full h-9 pl-9 pr-3 rounded-md border border-input bg-background text-sm font-normal"
              />
            </div>
          </div>
          {!hydrated ? null : filtered.length === 0 ? (
            <div className="p-8 text-sm text-muted-foreground text-center">
              {customers.length === 0
                ? "Koi customer nahi. \"Naya Customer\" se shuru karain."
                : "Koi match nahi mila."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground text-left">
                  <tr>
                    <th className="px-4 py-2 font-medium">Customer</th>
                    <th className="px-4 py-2 font-medium">Phone</th>
                    <th className="px-4 py-2 font-medium">Entries</th>
                    <th className="px-4 py-2 font-medium">Total Bill</th>
                    <th className="px-4 py-2 font-medium">Paid</th>
                    <th className="px-4 py-2 font-medium">Remaining</th>
                    <th className="px-4 py-2 font-medium">Last Activity</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((r) => (
                    <tr key={r.c.id}>
                      <td className="px-4 py-2 font-medium">{r.c.name}</td>
                      <td className="px-4 py-2 text-muted-foreground">{r.c.phone || "—"}</td>
                      <td className="px-4 py-2 text-muted-foreground">{r.count}</td>
                      <td className="px-4 py-2">Rs {r.totalBill.toFixed(0)}</td>
                      <td className="px-4 py-2 text-emerald-600">Rs {r.totalPaid.toFixed(0)}</td>
                      <td className={"px-4 py-2 font-medium " + (r.remaining > 0 ? "text-destructive" : "text-emerald-600")}>
                        Rs {r.remaining.toFixed(0)}
                      </td>
                      <td className="px-4 py-2 text-muted-foreground">
                        {r.last ? new Date(r.last).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => setPayCustomer(r.c)}
                            className="inline-flex items-center gap-1 h-7 px-2 rounded-md bg-emerald-600 text-white text-xs hover:bg-emerald-700"
                          >
                            <Wallet className="h-3.5 w-3.5" /> Pay
                          </button>
                          <button
                            onClick={() => setOpenCustomer(r.c)}
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            <Eye className="h-3.5 w-3.5" /> View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {addOpen && <AddCustomerModal onClose={() => setAddOpen(false)} />}
      {openCustomer && (
        <CustomerLedgerModal
          customer={openCustomer}
          onClose={() => setOpenCustomer(null)}
        />
      )}
      {payCustomer && (
        <AddLedgerPaymentModal
          customer={payCustomer}
          onClose={() => setPayCustomer(null)}
          summary={(() => {
            const es = entries.filter((e) => e.customerId === payCustomer.id);
            const bill = es.reduce((s, e) => (e.kind === "sale" ? s + e.total : s), 0);
            const paid = es.reduce((s, e) => (e.kind === "payment" ? s + e.amount : s), 0);
            return { bill, paid, remaining: Math.max(0, bill - paid) };
          })()}
        />
      )}
    </PosLayout>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "ok" | "bad";
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div
        className={
          "mt-1 text-xl font-semibold " +
          (tone === "ok" ? "text-emerald-600" : tone === "bad" ? "text-destructive" : "")
        }
      >
        {value}
      </div>
    </div>
  );
}

function AddCustomerModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState(todayInput());
  const [amount, setAmount] = useState("");
  const [paid, setPaid] = useState("");
  const [err, setErr] = useState("");

  const billAmt = Number(amount) || 0;
  const paidAmt = Number(paid) || 0;
  const remaining = Math.max(0, billAmt - paidAmt);

  async function submit() {
    setErr("");
    try {
      const c = await addLedgerCustomer({ name, phone });
      const iso = new Date(date).toISOString();
      if (billAmt > 0) {
        await addLedgerDirectBill({
          customerId: c.id,
          amount: billAmt,
          date: iso,
          note: "Opening bill",
        });
      }
      if (paidAmt > 0) {
        await addLedgerPayment({
          customerId: c.id,
          amount: paidAmt,
          date: iso,
          note: "Opening payment",
        });
      }
      onClose();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Error");
    }
  }
  return (
    <Modal title="Naya customer" onClose={onClose}>
      <div className="p-4 space-y-3 text-sm">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground">Customer name</label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Phone (optional)</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="tel"
              className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
            />
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground">Bill amount (optional)</label>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="decimal"
              placeholder="0"
              className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Amount paid (optional)</label>
            <input
              value={paid}
              onChange={(e) => setPaid(e.target.value)}
              inputMode="decimal"
              placeholder="0"
              className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
            />
          </div>
        </div>
        {(billAmt > 0 || paidAmt > 0) && (
          <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
            <span className="text-muted-foreground">Remaining</span>
            <span className={"font-semibold " + (remaining > 0 ? "text-destructive" : "text-emerald-600")}>
              Rs {remaining.toFixed(0)}
            </span>
          </div>
        )}
        {err && <div className="text-sm text-destructive">{err}</div>}
      </div>
      <div className="p-4 border-t border-border flex items-center justify-end gap-2">
        <button onClick={onClose} className="h-10 px-4 rounded-md border border-border text-sm">
          Cancel
        </button>
        <button
          onClick={submit}
          className="h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium"
        >
          Save
        </button>
      </div>
    </Modal>
  );
}

function CustomerLedgerModal({
  customer,
  onClose,
}: {
  customer: LedgerCustomer;
  onClose: () => void;
}) {
  const entries = useLedgerEntries();
  const [mode, setMode] = useState<null | "sale" | "payment">(null);

  const list = useMemo(
    () =>
      entries
        .filter((e) => e.customerId === customer.id)
        .slice()
        .sort((a, b) => {
          const d = new Date(a.date).getTime() - new Date(b.date).getTime();
          if (d !== 0) return d;
          // Same timestamp: bill before payment for natural running balance
          if (a.kind === b.kind) return 0;
          return a.kind === "sale" ? -1 : 1;
        }),
    [entries, customer.id],
  );


  const totalBill = list.reduce((s, e) => (e.kind === "sale" ? s + e.total : s), 0);
  const totalPaid = list.reduce((s, e) => (e.kind === "payment" ? s + e.amount : s), 0);
  const remaining = Math.max(0, totalBill - totalPaid);

  let running = 0;
  const rows = list.map((e) => {
    if (e.kind === "sale") running += e.total;
    else running -= e.amount;
    return { e, balance: running };
  });

  async function confirmDeleteCustomer() {
    if (!window.confirm(`"${customer.name}" ka pura ledger delete kar dein?`)) return;
    try {
      await deleteLedgerCustomer(customer.id);
      onClose();
    } catch {
      /* ignore */
    }
  }

  return (
    <Modal title={`Ledger — ${customer.name}`} onClose={onClose} width="max-w-3xl">
      <div className="p-4 space-y-4 text-sm">
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Total Bill" value={`Rs ${totalBill.toFixed(0)}`} />
          <StatCard label="Paid" value={`Rs ${totalPaid.toFixed(0)}`} tone="ok" />
          <StatCard
            label="Remaining"
            value={`Rs ${remaining.toFixed(0)}`}
            tone={remaining > 0 ? "bad" : "ok"}
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setMode("sale")}
            className="h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm inline-flex items-center gap-2"
          >
            <ShoppingCart className="h-4 w-4" /> Naya Bill (Saman diya)
          </button>
          <button
            onClick={() => setMode("payment")}
            className="h-9 px-3 rounded-md border border-border text-sm inline-flex items-center gap-2"
          >
            <Wallet className="h-4 w-4" /> Payment Received
          </button>
          <button
            onClick={confirmDeleteCustomer}
            className="ml-auto h-9 px-3 rounded-md border border-border text-xs text-destructive inline-flex items-center gap-1"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete customer
          </button>
        </div>

        <div className="rounded-md border border-border overflow-hidden">
          <div className="px-3 py-2 bg-muted/50 text-xs font-medium text-muted-foreground">
            Date-wise history ({rows.length})
          </div>
          {rows.length === 0 ? (
            <div className="p-6 text-xs text-muted-foreground text-center">
              Abhi tak koi entry nahi. Upar se bill ya payment add karain.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/30 text-muted-foreground text-left">
                  <tr>
                    <th className="px-3 py-2 font-medium">Date</th>
                    <th className="px-3 py-2 font-medium">Type</th>
                    <th className="px-3 py-2 font-medium">Details</th>
                    <th className="px-3 py-2 font-medium text-right">Bill</th>
                    <th className="px-3 py-2 font-medium text-right">Payment</th>
                    <th className="px-3 py-2 font-medium text-right">Balance</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map(({ e, balance }) => (
                    <tr key={e.id}>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {new Date(e.date).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2">
                        {e.kind === "sale" ? (
                          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs bg-primary/10 text-primary">
                            Bill
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                            Payment
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">
                        {e.kind === "sale"
                          ? (e.items.length > 0
                              ? e.items.map((i) => `${i.code}×${i.qty}`).join(", ")
                              : e.note || "Direct bill")
                          : e.note || "—"}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {e.kind === "sale" ? `Rs ${e.total.toFixed(0)}` : ""}
                      </td>
                      <td className="px-3 py-2 text-right text-emerald-600">
                        {e.kind === "payment" ? `Rs ${e.amount.toFixed(0)}` : ""}
                      </td>
                      <td
                        className={
                          "px-3 py-2 text-right font-medium " +
                          (balance > 0 ? "text-destructive" : "text-emerald-600")
                        }
                      >
                        Rs {balance.toFixed(0)}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          onClick={async () => {
                            if (window.confirm("Ye entry delete karain?")) {
                              try {
                                await deleteLedgerEntry(e.id);
                              } catch {
                                /* ignore */
                              }
                            }
                          }}
                          className="text-muted-foreground hover:text-destructive"
                          title="Delete entry"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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
      <div className="p-4 border-t border-border flex items-center justify-end">
        <button onClick={onClose} className="h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium">
          Close
        </button>
      </div>

      {mode === "sale" && (
        <AddLedgerSaleModal customer={customer} onClose={() => setMode(null)} />
      )}
      {mode === "payment" && (
        <AddLedgerPaymentModal
          customer={customer}
          onClose={() => setMode(null)}
          summary={{ bill: totalBill, paid: totalPaid, remaining }}
        />
      )}
    </Modal>
  );
}

function AddLedgerSaleModal({
  customer,
  onClose,
}: {
  customer: LedgerCustomer;
  onClose: () => void;
}) {
  const products = useProducts();
  const [date, setDate] = useState(todayInput());
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<Record<string, { qty: number; sellPrice: number }>>({});
  const [note, setNote] = useState("");
  const [err, setErr] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter(
      (p) => p.code.toLowerCase().includes(q) || (p.company || "").toLowerCase().includes(q),
    );
  }, [products, query]);

  const items: LedgerSaleItem[] = Object.entries(cart)
    .filter(([, v]) => v.qty > 0)
    .map(([code, v]) => ({ code, qty: v.qty, sellPrice: v.sellPrice }));
  const total = items.reduce((s, i) => s + i.qty * i.sellPrice, 0);

  function setLine(code: string, patch: Partial<{ qty: number; sellPrice: number }>) {
    setCart((c) => {
      const p = products.find((x) => x.code === code);
      const cur = c[code] || { qty: 0, sellPrice: p?.sellPrice || 0 };
      return { ...c, [code]: { ...cur, ...patch } };
    });
  }

  async function submit() {
    setErr("");
    try {
      await addLedgerSale({
        customerId: customer.id,
        items,
        date: new Date(date).toISOString(),
        note: note.trim() || undefined,
      });
      onClose();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Error");
    }
  }

  return (
    <Modal title={`Naya bill — ${customer.name}`} onClose={onClose} width="max-w-2xl">
      <div className="p-4 space-y-3 text-sm">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Note (optional)</label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
            />
          </div>
        </div>

        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search product code / company…"
            className="w-full h-9 pl-9 pr-3 rounded-md border border-input bg-background text-sm"
          />
        </div>

        <div className="rounded-md border border-border overflow-hidden max-h-64 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-4 text-xs text-muted-foreground text-center">
              Koi product nahi mila. POP se products add karain.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((p) => {
                const line = cart[p.code] || { qty: 0, sellPrice: p.sellPrice };
                return (
                  <div key={p.code} className="p-2 flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{p.code}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {p.company} · Stock {p.stock}
                      </div>
                    </div>
                    <input
                      type="number"
                      value={line.sellPrice}
                      onChange={(e) => setLine(p.code, { sellPrice: Number(e.target.value) })}
                      className="w-20 h-8 px-2 rounded-md border border-input bg-background text-xs"
                    />
                    <button
                      onClick={() => setLine(p.code, { qty: Math.max(0, line.qty - 1) })}
                      className="h-8 w-8 rounded-md border border-border inline-flex items-center justify-center"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <input
                      type="number"
                      value={line.qty}
                      onChange={(e) =>
                        setLine(p.code, { qty: Math.max(0, Number(e.target.value)) })
                      }
                      className="w-14 h-8 px-2 rounded-md border border-input bg-background text-xs text-center"
                    />
                    <button
                      onClick={() => setLine(p.code, { qty: line.qty + 1 })}
                      className="h-8 w-8 rounded-md border border-border inline-flex items-center justify-center"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-muted-foreground">Bill total</span>
          <span className="text-lg font-semibold">Rs {total.toFixed(0)}</span>
        </div>
        {err && <div className="text-sm text-destructive">{err}</div>}
      </div>
      <div className="p-4 border-t border-border flex items-center justify-end gap-2">
        <button onClick={onClose} className="h-10 px-4 rounded-md border border-border text-sm">
          Cancel
        </button>
        <button
          onClick={submit}
          disabled={items.length === 0}
          className="h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
        >
          Save Bill
        </button>
      </div>
    </Modal>
  );
}

function AddLedgerPaymentModal({
  customer,
  onClose,
  summary,
}: {
  customer: LedgerCustomer;
  onClose: () => void;
  summary?: { bill: number; paid: number; remaining: number };
}) {
  const [date, setDate] = useState(todayInput());
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [err, setErr] = useState("");

  const payAmt = Number(amount) || 0;
  const newRemaining = summary
    ? Math.max(0, summary.remaining - payAmt)
    : 0;

  async function submit() {
    setErr("");
    try {
      await addLedgerPayment({
        customerId: customer.id,
        amount: Number(amount),
        date: new Date(date).toISOString(),
        note: note.trim() || undefined,
      });
      onClose();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Error");
    }
  }

  return (
    <Modal title={`Payment received — ${customer.name}`} onClose={onClose}>
      <div className="p-4 space-y-3 text-sm">
        {summary && (
          <div className="grid grid-cols-3 gap-2 rounded-md border border-border p-3 bg-muted/30 text-xs">
            <div>
              <div className="text-muted-foreground">Total Bill</div>
              <div className="font-semibold">Rs {summary.bill.toFixed(0)}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Paid</div>
              <div className="font-semibold text-emerald-600">Rs {summary.paid.toFixed(0)}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Remaining</div>
              <div className={"font-semibold " + (summary.remaining > 0 ? "text-destructive" : "text-emerald-600")}>
                Rs {summary.remaining.toFixed(0)}
              </div>
            </div>
          </div>
        )}
        <div>
          <label className="text-xs text-muted-foreground">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Amount</label>
          <input
            autoFocus
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
          />
        </div>
        {summary && payAmt > 0 && (
          <div className="flex items-center justify-between text-xs px-1">
            <span className="text-muted-foreground">Is payment ke baad remaining</span>
            <span className={"font-semibold " + (newRemaining > 0 ? "text-destructive" : "text-emerald-600")}>
              Rs {newRemaining.toFixed(0)}
            </span>
          </div>
        )}
        <div>
          <label className="text-xs text-muted-foreground">Note (optional)</label>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
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
          onClick={submit}
          className="h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium"
        >
          Save Payment
        </button>
      </div>
    </Modal>
  );
}

function Modal({
  title,
  onClose,
  children,
  width = "max-w-md",
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: string;
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className={"bg-card border border-border rounded-xl w-full max-h-[90vh] overflow-auto " + width}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="font-semibold">{title}</div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-md hover:bg-accent inline-flex items-center justify-center"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
