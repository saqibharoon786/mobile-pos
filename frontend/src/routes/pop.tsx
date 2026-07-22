import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PosLayout } from "@/components/pos-layout";
import {
  useProducts,
  saveProduct,
  deleteProduct,
  useHydrated,
} from "@/lib/pos-store";
import { Trash2, Plus } from "lucide-react";

export const Route = createFileRoute("/pop")({
  head: () => ({
    meta: [
      { title: "POP — Products — Battery POS" },
      { name: "description", content: "Add and manage mobile battery products." },
    ],
  }),
  component: PopPage,
});

function PopPage() {
  const products = useProducts();
  const hydrated = useHydrated();

  const [code, setCode] = useState("");
  const [company, setCompany] = useState("");
  const [purchase, setPurchase] = useState("");
  const [sell, setSell] = useState("");
  const [stock, setStock] = useState("");
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!code.trim()) return setErr("Code is required (e.g. bg-7)");
    if (!company.trim()) return setErr("Company name is required");
    const pp = Number(purchase);
    const sp = Number(sell);
    const st = Number(stock || "0");
    if (!Number.isFinite(pp) || pp < 0) return setErr("Invalid purchase price");
    if (!Number.isFinite(sp) || sp < 0) return setErr("Invalid selling price");
    if (!Number.isFinite(st) || st < 0) return setErr("Invalid stock");
    try {
      await saveProduct({
        code: code.trim(),
        company: company.trim(),
        purchasePrice: pp,
        sellPrice: sp,
        stock: st,
      });
      setCode("");
      setCompany("");
      setPurchase("");
      setSell("");
      setStock("");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Error");
    }
  }

  return (
    <PosLayout>
      <div className="max-w-6xl">
        <h1 className="text-2xl font-semibold">POP — Products</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Add battery products by code (e.g. <code className="px-1 rounded bg-muted">bg-7</code>), with purchase and selling price.
        </p>

        <form
          onSubmit={submit}
          className="mt-6 rounded-xl border border-border bg-card p-4 grid grid-cols-1 md:grid-cols-6 gap-3"
        >
          <div className="md:col-span-1">
            <label className="text-xs text-muted-foreground">Code</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="bg-5"
              className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Company</label>
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="ABC Company"
              className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Purchase Rs</label>
            <input
              value={purchase}
              onChange={(e) => setPurchase(e.target.value)}
              inputMode="decimal"
              placeholder="500"
              className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Selling Rs</label>
            <input
              value={sell}
              onChange={(e) => setSell(e.target.value)}
              inputMode="decimal"
              placeholder="700"
              className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Stock</label>
            <input
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              inputMode="numeric"
              placeholder="10"
              className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium inline-flex items-center justify-center gap-2 hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" /> Add / Update
            </button>
          </div>
          {err && (
            <div className="md:col-span-6 text-sm text-destructive">{err}</div>
          )}
        </form>

        <div className="mt-6 rounded-xl border border-border bg-card overflow-hidden">
          <div className="p-4 border-b border-border font-medium">
            All products {hydrated && `(${products.length})`}
          </div>
          {!hydrated ? null : products.length === 0 ? (
            <div className="p-8 text-sm text-muted-foreground text-center">
              No products yet. Add your first battery above.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr className="text-left">
                    <th className="px-4 py-2 font-medium">Code</th>
                    <th className="px-4 py-2 font-medium">Company</th>
                    <th className="px-4 py-2 font-medium">Purchase</th>
                    <th className="px-4 py-2 font-medium">Selling</th>
                    <th className="px-4 py-2 font-medium">Margin</th>
                    <th className="px-4 py-2 font-medium">Stock</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {products.map((p) => (
                    <tr key={p.code}>
                      <td className="px-4 py-2 font-medium">{p.code}</td>
                      <td className="px-4 py-2">{p.company || "—"}</td>
                      <td className="px-4 py-2">Rs {p.purchasePrice}</td>
                      <td className="px-4 py-2">Rs {p.sellPrice}</td>
                      <td className="px-4 py-2 text-emerald-600">
                        Rs {p.sellPrice - p.purchasePrice}
                      </td>
                      <td className="px-4 py-2">{p.stock}</td>
                      <td className="px-4 py-2 text-right">
                        <button
                          onClick={async () => {
                            if (!window.confirm(`Product "${p.code}" delete kar dein?`)) return;
                            try {
                              await deleteProduct(p.code);
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
    </PosLayout>
  );
}