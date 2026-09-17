import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";
import {
  Eye,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Wrench,
  X,
} from "lucide-react";
import { PosLayout } from "@/components/pos-layout";
import {
  addRepairVisit,
  deleteRepairCustomer,
  deleteRepairVisit,
  updateRepairVisit,
  useHydrated,
  useProducts,
  useRepairCustomers,
  type RepairCustomer,
  type RepairVisit,
} from "@/lib/pos-store";

export const Route = createFileRoute("/repair-customers")({
  head: () => ({
    meta: [
      { title: "Repair Customer — Gul Battery House" },
      { name: "description", content: "Track repair customers and battery work details." },
    ],
  }),
  component: RepairCustomersPage,
});

type FormMode =
  | { type: "new" }
  | { type: "repeat"; customer: RepairCustomer }
  | { type: "edit"; customer: RepairCustomer; visit: RepairVisit };

function todayInput() {
  const date = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function latestVisit(customer: RepairCustomer): RepairVisit | undefined {
  return customer.visits[0];
}

function totalSpent(customer: RepairCustomer) {
  return customer.visits.reduce((sum, visit) => sum + visit.soldPrice, 0);
}

function matchesSearch(customer: RepairCustomer, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const fields = [
    customer.customerName,
    customer.id,
    formatDate(customer.date),
    ...customer.visits.flatMap((visit) => [
      visit.itemName,
      visit.productCode,
      visit.note,
      String(visit.soldPrice),
      String(visit.qty),
      formatDate(visit.date),
    ]),
  ];
  return fields.some((value) => value.toLowerCase().includes(q));
}

function RepairCustomersPage() {
  const customers = useRepairCustomers();
  const hydrated = useHydrated();
  const [query, setQuery] = useState("");
  const [formMode, setFormMode] = useState<FormMode | null>(null);
  const [historyCustomer, setHistoryCustomer] = useState<RepairCustomer | null>(null);

  const filtered = useMemo(
    () => customers.filter((customer) => matchesSearch(customer, query)),
    [customers, query],
  );

  const totalVisits = customers.reduce((sum, customer) => sum + customer.visits.length, 0);

  return (
    <PosLayout>
      <div className="max-w-6xl">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold">Repair Customer</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Customer battery le kar gaya — POP se stock minus hoga. Ek customer ka ek hi record, saari visits history mein.
            </p>
          </div>
          <button
            onClick={() => setFormMode({ type: "new" })}
            className="h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium inline-flex items-center gap-2 hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> Naya Customer
          </button>
        </div>

        <div className="mt-6 rounded-xl border border-border bg-card overflow-hidden">
          <div className="p-4 border-b border-border space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Wrench className="h-4 w-4" />
              <span className="font-medium">Customers</span>
              {hydrated && (
                <span className="text-xs text-muted-foreground">
                  ({filtered.length}
                  {query ? ` / ${customers.length}` : ""} customers · {totalVisits} visits)
                </span>
              )}
            </div>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Naam, battery, product code, price ya date se search…"
                className="w-full h-9 pl-9 pr-9 rounded-md border border-input bg-background text-sm"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-md hover:bg-accent inline-flex items-center justify-center text-muted-foreground"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {!hydrated ? null : filtered.length === 0 ? (
            <div className="p-8 text-sm text-muted-foreground text-center">
              {customers.length === 0
                ? "Abhi koi record nahi. Naya Customer dabain."
                : "Koi match nahi mila. Search change karke try karain."}
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[560px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground text-left sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-2 font-medium">Customer</th>
                    <th className="px-4 py-2 font-medium">Visits</th>
                    <th className="px-4 py-2 font-medium">Last Date</th>
                    <th className="px-4 py-2 font-medium">Latest Battery</th>
                    <th className="px-4 py-2 font-medium">Product</th>
                    <th className="px-4 py-2 font-medium">Kitne Mein Li</th>
                    <th className="px-4 py-2 font-medium">Total</th>
                    <th className="px-4 py-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((customer) => {
                    const latest = latestVisit(customer);
                    return (
                      <tr key={customer.id} className="hover:bg-muted/20">
                        <td className="px-4 py-3">
                          <div className="font-medium">{customer.customerName}</div>
                          <div className="text-[11px] text-muted-foreground">{customer.id}</div>
                        </td>
                        <td className="px-4 py-3">{customer.visits.length}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {latest ? formatDate(latest.date) : "—"}
                        </td>
                        <td className="px-4 py-3">{latest?.itemName || "—"}</td>
                        <td className="px-4 py-3">{latest?.productCode || "—"}</td>
                        <td className="px-4 py-3 whitespace-nowrap font-medium">
                          {latest ? `Rs ${latest.soldPrice.toFixed(0)}` : "—"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          Rs {totalSpent(customer).toFixed(0)}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-2 flex-wrap justify-end">
                            <button
                              type="button"
                              onClick={() => setHistoryCustomer(customer)}
                              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                            >
                              <Eye className="h-3.5 w-3.5" /> History
                            </button>
                            <button
                              type="button"
                              onClick={() => setFormMode({ type: "repeat", customer })}
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                              <RefreshCw className="h-3.5 w-3.5" /> Dobara
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                if (
                                  !window.confirm(
                                    `${customer.customerName} ka poora record delete kar dein?`,
                                  )
                                )
                                  return;
                                await deleteRepairCustomer(customer.id);
                              }}
                              className="inline-flex items-center gap-1 text-xs text-destructive hover:underline"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Delete
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

      {formMode && <RepairForm mode={formMode} onClose={() => setFormMode(null)} />}
      {historyCustomer && (
        <HistoryModal
          customer={historyCustomer}
          onClose={() => setHistoryCustomer(null)}
          onEdit={(visit) => {
            setHistoryCustomer(null);
            setFormMode({ type: "edit", customer: historyCustomer, visit });
          }}
          onDeleteVisit={deleteRepairVisit}
        />
      )}
    </PosLayout>
  );
}

function HistoryModal({
  customer,
  onClose,
  onEdit,
  onDeleteVisit,
}: {
  customer: RepairCustomer;
  onClose: () => void;
  onEdit: (visit: RepairVisit) => void;
  onDeleteVisit: (customerId: string, visitId: string) => Promise<void>;
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl rounded-xl border border-border bg-card shadow-xl overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold">{customer.customerName} — History</h2>
            <p className="text-sm text-muted-foreground">
              {customer.visits.length} visits · Total Rs {totalSpent(customer).toFixed(0)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-md hover:bg-accent inline-flex items-center justify-center"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground text-left sticky top-0">
              <tr>
                <th className="px-4 py-2 font-medium">#</th>
                <th className="px-4 py-2 font-medium">Date</th>
                <th className="px-4 py-2 font-medium">Battery</th>
                <th className="px-4 py-2 font-medium">Product</th>
                <th className="px-4 py-2 font-medium">Qty</th>
                <th className="px-4 py-2 font-medium">Kitne Mein Li</th>
                <th className="px-4 py-2 font-medium">Note</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[...customer.visits]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((visit) => {
                  const visitNo =
                    [...customer.visits]
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .findIndex((v) => v.id === visit.id) + 1;
                  return (
                  <tr key={visit.id}>
                    <td className="px-4 py-2 text-muted-foreground">#{visitNo}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{formatDate(visit.date)}</td>
                    <td className="px-4 py-2">{visit.itemName}</td>
                    <td className="px-4 py-2">{visit.productCode || "—"}</td>
                    <td className="px-4 py-2">{visit.qty}</td>
                    <td className="px-4 py-2 font-medium">Rs {visit.soldPrice.toFixed(0)}</td>
                    <td className="px-4 py-2 text-muted-foreground max-w-[140px] truncate">
                      {visit.note || "—"}
                    </td>
                    <td className="px-4 py-2 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onEdit(visit)}
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            if (!window.confirm("Ye visit delete kar dein?")) return;
                            await onDeleteVisit(customer.id, visit.id);
                            onClose();
                          }}
                          className="inline-flex items-center gap-1 text-xs text-destructive hover:underline"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function RepairForm({ mode, onClose }: { mode: FormMode; onClose: () => void }) {
  const products = useProducts();
  const isEdit = mode.type === "edit";
  const isRepeat = mode.type === "repeat";
  const customer = isEdit || isRepeat ? mode.customer : null;
  const visit = isEdit ? mode.visit : null;

  const [customerName, setCustomerName] = useState(
    isEdit || isRepeat ? customer!.customerName : "",
  );
  const [itemName, setItemName] = useState(isEdit ? visit!.itemName : "");
  const [productCode, setProductCode] = useState(isEdit ? visit!.productCode : "");
  const [qty, setQty] = useState(isEdit ? String(visit!.qty) : "1");
  const [soldPrice, setSoldPrice] = useState(isEdit ? String(visit!.soldPrice) : "");
  const [date, setDate] = useState(
    isEdit ? visit!.date.slice(0, 10) : todayInput(),
  );
  const [note, setNote] = useState(isEdit ? visit!.note : "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const selectedProduct = products.find(
    (product) => product.code.toLowerCase() === productCode.toLowerCase(),
  );

  function onProductChange(code: string) {
    setProductCode(code);
    const product = products.find((p) => p.code === code);
    if (product && !itemName.trim()) {
      setItemName(`${product.company} ${product.code} battery`.trim());
    }
  }

  const title =
    mode.type === "edit"
      ? "Visit Edit Karain"
      : mode.type === "repeat"
        ? "Dobara Battery Li"
        : "Naya Repair Customer";

  const subtitle =
    mode.type === "repeat"
      ? `${customer!.customerName} ke record mein nayi visit add hogi — alag record nahi banega.`
      : "POP se product select karain, stock automatic minus hoga.";

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const q = Math.max(1, Number(qty) || 1);
    const sold = Number(soldPrice);

    if (!customerName.trim()) {
      setError("Customer ka naam likhain.");
      setSaving(false);
      return;
    }
    if (!itemName.trim()) {
      setError("Battery ka naam likhain.");
      setSaving(false);
      return;
    }
    if (!productCode.trim()) {
      setError("POP se product select karain.");
      setSaving(false);
      return;
    }
    if (!Number.isFinite(sold) || sold < 0) {
      setError("Kitne mein li — ye price sahi likhain.");
      setSaving(false);
      return;
    }
    if (selectedProduct && selectedProduct.stock < q && !isEdit) {
      setError(`Stock kam hai — sirf ${selectedProduct.stock} available.`);
      setSaving(false);
      return;
    }

    try {
      const payload = {
        customerName: customerName.trim(),
        itemName: itemName.trim(),
        productCode: productCode.trim(),
        qty: q,
        soldPrice: sold,
        date: new Date(`${date}T12:00:00`).toISOString(),
        note: note.trim(),
      };

      if (isEdit) {
        await updateRepairVisit(customer!.id, visit!.id, payload);
      } else {
        await addRepairVisit(payload);
      }
      onClose();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Record save nahi hua.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        className="w-full max-w-lg rounded-xl border border-border bg-card shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-md hover:bg-accent inline-flex items-center justify-center text-muted-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1 text-sm sm:col-span-2">
            <span className="text-xs text-muted-foreground">Customer ka naam</span>
            <input
              required
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              readOnly={isRepeat}
              className={`h-10 rounded-md border border-input bg-background px-3 ${isRepeat ? "bg-muted/50" : ""}`}
              placeholder="Customer ka naam"
            />
          </label>

          <label className="grid gap-1 text-sm sm:col-span-2">
            <span className="text-xs text-muted-foreground">POP Product (stock yahan se minus)</span>
            <select
              required
              value={productCode}
              onChange={(event) => onProductChange(event.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3"
            >
              <option value="">Product select karain…</option>
              {products.map((product) => (
                <option key={product.code} value={product.code}>
                  {product.code} · {product.company} · Stock {product.stock} · Rs {product.purchasePrice}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 text-sm sm:col-span-2">
            <span className="text-xs text-muted-foreground">Original battery (pehle kya thi / detail)</span>
            <input
              required
              value={itemName}
              onChange={(event) => setItemName(event.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3"
              placeholder="e.g. Samsung A51 original battery"
            />
          </label>

          <label className="grid gap-1 text-sm">
            <span className="text-xs text-muted-foreground">Qty</span>
            <input
              required
              min="1"
              type="number"
              value={qty}
              onChange={(event) => setQty(event.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3"
            />
          </label>

          <label className="grid gap-1 text-sm">
            <span className="text-xs text-muted-foreground">Kitne mein li (Rs)</span>
            <input
              required
              min="0"
              type="number"
              value={soldPrice}
              onChange={(event) => setSoldPrice(event.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3"
              placeholder="0"
            />
          </label>

          <label className="grid gap-1 text-sm sm:col-span-2">
            <span className="text-xs text-muted-foreground">Date</span>
            <input
              required
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3"
            />
          </label>

          <label className="grid gap-1 text-sm sm:col-span-2">
            <span className="text-xs text-muted-foreground">Note (optional)</span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className="min-h-20 rounded-md border border-input bg-background px-3 py-2"
              placeholder="Extra detail"
            />
          </label>

          {selectedProduct && (
            <p className="text-xs text-muted-foreground sm:col-span-2">
              Available stock: {selectedProduct.stock} · Purchase: Rs {selectedProduct.purchasePrice}
            </p>
          )}

          {error && <p className="text-sm text-destructive sm:col-span-2">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 p-5 border-t border-border">
          <button type="button" onClick={onClose} className="h-10 px-4 rounded-md border border-input text-sm">
            Cancel
          </button>
          <button
            disabled={saving}
            className="h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
          >
            {saving ? "Saving…" : isEdit ? "Update Visit" : isRepeat ? "Visit Add Karain" : "Save Record"}
          </button>
        </div>
      </form>
    </div>
  );
}
