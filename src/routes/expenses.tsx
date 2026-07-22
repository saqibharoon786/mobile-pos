import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { PosLayout } from "@/components/pos-layout";
import { useExpenses, addExpense, deleteExpense, useHydrated } from "@/lib/pos-store";
import { Plus, Trash2, X, Wallet } from "lucide-react";

export const Route = createFileRoute("/expenses")({
  head: () => ({
    meta: [
      { title: "Expenses — Battery POS" },
      { name: "description", content: "Daily expense tracking for the shop." },
    ],
  }),
  component: ExpensesPage,
});

function ExpensesPage() {
  const expenses = useExpenses();
  const hydrated = useHydrated();
  const [open, setOpen] = useState(false);

  const today = new Date().toDateString();
  const todayTotal = useMemo(
    () =>
      expenses
        .filter((e) => new Date(e.date).toDateString() === today)
        .reduce((s, e) => s + e.amount, 0),
    [expenses, today],
  );
  const monthTotal = useMemo(() => {
    const now = new Date();
    return expenses
      .filter((e) => {
        const d = new Date(e.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((s, e) => s + e.amount, 0);
  }, [expenses]);

  return (
    <PosLayout>
      <div className="max-w-6xl">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Expenses</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Daily shop expenses ka record.
            </p>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium inline-flex items-center gap-2 hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> Add Expense
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
          {[
            { label: "Today", value: todayTotal },
            { label: "This month", value: monthTotal },
            { label: "All time", value: expenses.reduce((s, e) => s + e.amount, 0) },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">{s.label}</div>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="mt-2 text-2xl font-semibold">
                {hydrated ? `Rs ${s.value.toFixed(0)}` : "—"}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-xl border border-border bg-card overflow-hidden">
          <div className="p-4 border-b border-border font-medium">
            All expenses {hydrated && `(${expenses.length})`}
          </div>
          {!hydrated ? null : expenses.length === 0 ? (
            <div className="p-8 text-sm text-muted-foreground text-center">
              Koi expense nahi. "Add Expense" se shuru karain.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground text-left">
                  <tr>
                    <th className="px-4 py-2 font-medium">Date</th>
                    <th className="px-4 py-2 font-medium">Category</th>
                    <th className="px-4 py-2 font-medium">Note</th>
                    <th className="px-4 py-2 font-medium">Amount</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {expenses.map((e) => (
                    <tr key={e.id}>
                      <td className="px-4 py-2 text-muted-foreground">
                        {new Date(e.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 font-medium">{e.category}</td>
                      <td className="px-4 py-2 text-muted-foreground">{e.note || "—"}</td>
                      <td className="px-4 py-2">Rs {e.amount.toFixed(0)}</td>
                      <td className="px-4 py-2 text-right">
                        <button
                          onClick={async () => {
                            try {
                              await deleteExpense(e.id);
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

      {open && <ExpenseForm onClose={() => setOpen(false)} />}
    </PosLayout>
  );
}

function ExpenseForm({ onClose }: { onClose: () => void }) {
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [err, setErr] = useState("");

  async function submit() {
    setErr("");
    if (!category.trim()) return setErr("Category likhain (e.g. Rent, Bijli)");
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) return setErr("Amount valid ho");
    try {
      await addExpense({ category: category.trim(), amount: n, note: note.trim() });
      onClose();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Error");
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="font-semibold">Add Expense</div>
          <button onClick={onClose} className="h-8 w-8 rounded-md hover:bg-accent inline-flex items-center justify-center">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">Category</label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Rent, Bijli, Chai"
              className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Amount (Rs)</label>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="decimal"
              placeholder="500"
              className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Note (optional)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="mt-1 w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
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
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
