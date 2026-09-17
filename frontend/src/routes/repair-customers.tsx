import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";
import { Pencil, Plus, RefreshCw, Search, Trash2, User, Wrench, X } from "lucide-react";
import { PosLayout } from "@/components/pos-layout";
import {
  addRepairCustomer,
  deleteRepairCustomer,
  updateRepairCustomer,
  useHydrated,
  useRepairCustomers,
  type RepairCustomer,
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
  | { type: "repeat"; customerName: string }
  | { type: "edit"; record: RepairCustomer };

function todayInput() {
  const date = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function normalizeName(name: string) {
  return name.trim().toLowerCase();
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getVisitNumbers(records: RepairCustomer[]) {
  const byCustomer = new Map<string, RepairCustomer[]>();
  for (const record of records) {
    const key = normalizeName(record.customerName);
    const list = byCustomer.get(key) ?? [];
    list.push(record);
    byCustomer.set(key, list);
  }

  const visitMap = new Map<string, number>();
  for (const list of byCustomer.values()) {
    list
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .forEach((record, index) => visitMap.set(record.id, index + 1));
  }
  return visitMap;
}

function matchesSearch(record: RepairCustomer, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [
    record.customerName,
    record.itemName,
    record.note,
    record.id,
    String(record.actualPrice),
    String(record.soldPrice),
    formatDate(record.date),
    new Date(record.date).toLocaleDateString(),
  ].some((value) => value.toLowerCase().includes(q));
}

function RepairCustomersPage() {
  const records = useRepairCustomers();
  const hydrated = useHydrated();
  const [query, setQuery] = useState("");
  const [formMode, setFormMode] = useState<FormMode | null>(null);

  const visitNumbers = useMemo(() => getVisitNumbers(records), [records]);

  const filtered = useMemo(
    () => records.filter((record) => matchesSearch(record, query)),
    [records, query],
  );

  const customerSummary = useMemo(() => {
    const map = new Map<
      string,
      { name: string; visits: number; lastDate: string; lastBattery: string }
    >();

    for (const record of records) {
      const key = normalizeName(record.customerName);
      const existing = map.get(key);
      if (existing) {
        existing.visits += 1;
        if (new Date(record.date).getTime() > new Date(existing.lastDate).getTime()) {
          existing.lastDate = record.date;
          existing.lastBattery = record.itemName;
        }
      } else {
        map.set(key, {
          name: record.customerName.trim(),
          visits: 1,
          lastDate: record.date,
          lastBattery: record.itemName,
        });
      }
    }

    return Array.from(map.values())
      .filter((customer) => !query.trim() || customer.name.toLowerCase().includes(query.trim().toLowerCase()))
      .sort((a, b) => new Date(b.lastDate).getTime() - new Date(a.lastDate).getTime());
  }, [records, query]);

  const totalCustomers = customerSummary.length;
  const repeatCustomers = customerSummary.filter((c) => c.visits > 1).length;

  return (
    <PosLayout>
      <div className="max-w-6xl">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold">Repair Customer</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Customer battery le kar gaya — naam, original battery, asli keemat aur kitne mein li sab record hoga.
            </p>
          </div>
          <button
            onClick={() => setFormMode({ type: "new" })}
            className="h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium inline-flex items-center gap-2 hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> Naya Record
          </button>
        </div>

        {hydrated && customerSummary.length > 0 && (
          <div className="mt-6 rounded-xl border border-border bg-card overflow-hidden">
            <div className="p-4 border-b border-border flex items-center gap-2 flex-wrap">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Customers</span>
              <span className="text-xs text-muted-foreground">
                {totalCustomers} total · {repeatCustomers} dobara aaye
              </span>
            </div>
            <div className="p-3 flex flex-wrap gap-2 max-h-40 overflow-y-auto">
              {customerSummary.map((customer) => (
                <div
                  key={customer.name}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm"
                >
                  <div className="min-w-0">
                    <div className="font-medium truncate max-w-[140px]">{customer.name}</div>
                    <div className="text-[11px] text-muted-foreground truncate max-w-[160px]">
                      {customer.visits} visit · {customer.lastBattery}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormMode({ type: "repeat", customerName: customer.name })}
                    title={`${customer.name} dobara battery li`}
                    className="shrink-0 h-7 px-2 rounded-md bg-primary/10 text-primary text-xs font-medium inline-flex items-center gap-1 hover:bg-primary/20"
                  >
                    <RefreshCw className="h-3 w-3" /> Dobara
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 rounded-xl border border-border bg-card overflow-hidden">
          <div className="p-4 border-b border-border space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Wrench className="h-4 w-4" />
              <span className="font-medium">Saari visits</span>
              {hydrated && (
                <span className="text-xs text-muted-foreground">
                  ({filtered.length}
                  {query ? ` / ${records.length}` : ""} records)
                </span>
              )}
            </div>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Naam, battery, price, date ya note se search…"
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
              {records.length === 0
                ? "Abhi koi record nahi. Naya Record dabain."
                : "Koi match nahi mila. Search change karke try karain."}
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[560px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground text-left sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-2 font-medium">Date</th>
                    <th className="px-4 py-2 font-medium">Customer</th>
                    <th className="px-4 py-2 font-medium">Original Battery</th>
                    <th className="px-4 py-2 font-medium">Asli Keemat</th>
                    <th className="px-4 py-2 font-medium">Kitne Mein Li</th>
                    <th className="px-4 py-2 font-medium">Note</th>
                    <th className="px-4 py-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((record) => {
                    const visitNo = visitNumbers.get(record.id) ?? 1;
                    return (
                      <tr key={record.id} className="hover:bg-muted/20">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div>{formatDate(record.date)}</div>
                          <div className="text-[11px] text-muted-foreground">{record.id}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <div>
                              <div className="font-medium">{record.customerName}</div>
                              <div className="text-[11px] text-muted-foreground">Visit #{visitNo}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setFormMode({ type: "repeat", customerName: record.customerName })
                              }
                              title={`${record.customerName} dobara battery li`}
                              className="shrink-0 h-6 px-2 rounded-md bg-primary/10 text-primary text-[11px] font-medium inline-flex items-center gap-1 hover:bg-primary/20"
                            >
                              <RefreshCw className="h-3 w-3" /> Dobara
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3">{record.itemName}</td>
                        <td className="px-4 py-3 whitespace-nowrap">Rs {record.actualPrice.toFixed(0)}</td>
                        <td className="px-4 py-3 whitespace-nowrap font-medium">
                          Rs {record.soldPrice.toFixed(0)}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground max-w-[180px] truncate">
                          {record.note || "—"}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => setFormMode({ type: "edit", record })}
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                              <Pencil className="h-3.5 w-3.5" /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                if (!window.confirm("Ye record delete kar dein?")) return;
                                await deleteRepairCustomer(record.id);
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

      {formMode && (
        <RepairForm mode={formMode} onClose={() => setFormMode(null)} />
      )}
    </PosLayout>
  );
}

function RepairForm({ mode, onClose }: { mode: FormMode; onClose: () => void }) {
  const isEdit = mode.type === "edit";
  const record = isEdit ? mode.record : null;

  const [customerName, setCustomerName] = useState(
    isEdit ? record!.customerName : mode.type === "repeat" ? mode.customerName : "",
  );
  const [itemName, setItemName] = useState(isEdit ? record!.itemName : "");
  const [actualPrice, setActualPrice] = useState(isEdit ? String(record!.actualPrice) : "");
  const [soldPrice, setSoldPrice] = useState(isEdit ? String(record!.soldPrice) : "");
  const [date, setDate] = useState(
    isEdit ? record!.date.slice(0, 10) : todayInput(),
  );
  const [note, setNote] = useState(isEdit ? record!.note : "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const title =
    mode.type === "edit"
      ? "Record Edit Karain"
      : mode.type === "repeat"
        ? "Dobara Battery Li"
        : "Naya Repair Customer";

  const subtitle =
    mode.type === "repeat"
      ? `${mode.customerName} ne dobara battery li — nayi detail bharain.`
      : "Customer ka naam, original battery aur price detail bharain.";

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const actual = Number(actualPrice);
    const sold = Number(soldPrice);
    if (!customerName.trim()) {
      setError("Customer ka naam likhain.");
      setSaving(false);
      return;
    }
    if (!itemName.trim()) {
      setError("Original battery ka naam likhain.");
      setSaving(false);
      return;
    }
    if (!Number.isFinite(actual) || actual < 0) {
      setError("Asli keemat sahi likhain.");
      setSaving(false);
      return;
    }
    if (!Number.isFinite(sold) || sold < 0) {
      setError("Kitne mein li — ye price sahi likhain.");
      setSaving(false);
      return;
    }

    try {
      const payload = {
        customerName: customerName.trim(),
        itemName: itemName.trim(),
        actualPrice: actual,
        soldPrice: sold,
        date: new Date(`${date}T12:00:00`).toISOString(),
        note: note.trim(),
      };

      if (isEdit) {
        await updateRepairCustomer(record!.id, payload);
      } else {
        await addRepairCustomer(payload);
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
        className="w-full max-w-lg rounded-xl border border-border bg-card shadow-xl overflow-hidden"
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
            aria-label="Close"
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
              readOnly={mode.type === "repeat"}
              className={`h-10 rounded-md border border-input bg-background px-3 ${mode.type === "repeat" ? "bg-muted/50" : ""}`}
              placeholder="Customer ka naam"
            />
          </label>

          <label className="grid gap-1 text-sm sm:col-span-2">
            <span className="text-xs text-muted-foreground">Original battery (pehle kya thi)</span>
            <input
              required
              value={itemName}
              onChange={(event) => setItemName(event.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3"
              placeholder="e.g. Samsung A51 original battery"
            />
          </label>

          <label className="grid gap-1 text-sm">
            <span className="text-xs text-muted-foreground">Asli keemat (Rs)</span>
            <input
              required
              min="0"
              type="number"
              value={actualPrice}
              onChange={(event) => setActualPrice(event.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3"
              placeholder="0"
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
              placeholder="Extra detail, condition, etc."
            />
          </label>

          {error && <p className="text-sm text-destructive sm:col-span-2">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 p-5 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-4 rounded-md border border-input text-sm"
          >
            Cancel
          </button>
          <button
            disabled={saving}
            className="h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
          >
            {saving ? "Saving…" : isEdit ? "Update Record" : "Save Record"}
          </button>
        </div>
      </form>
    </div>
  );
}
