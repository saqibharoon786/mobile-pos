import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BatteryFull,
  Wallet,
  Truck,
  Building2,
  Receipt,
  Undo2,
  RotateCcw,
  BookUser,
} from "lucide-react";
import type { ReactNode } from "react";
import { useApiStatus } from "@/lib/pos-store";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/pop", label: "POP (Products)", icon: Package },
  { to: "/pos", label: "POS (Sell)", icon: ShoppingCart },
  { to: "/purchases", label: "Purchases", icon: Truck },
  { to: "/companies", label: "Companies", icon: Building2 },
  { to: "/sales", label: "Sales History", icon: Receipt },
  { to: "/ledger", label: "Ledger (Khata)", icon: BookUser },
  { to: "/expenses", label: "Expenses", icon: Wallet },
  { to: "/sales-return", label: "Sales Return", icon: Undo2 },
  { to: "/pop-return", label: "POP Return", icon: RotateCcw },
] as const;

export function PosLayout({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { connected, offline } = useApiStatus();
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <aside className="w-64 border-r border-border bg-card hidden md:flex flex-col">
        <div className="h-16 flex items-center gap-2 px-5 border-b border-border">
          <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
            <BatteryFull className="h-5 w-5" />
          </div>
          <div>
            <div className="font-semibold leading-tight">Battery POS</div>
            <div className="text-xs text-muted-foreground">Mobile batteries</div>
          </div>
        </div>
        <nav className="p-3 flex flex-col gap-1 overflow-auto">
          {nav.map((n) => {
            const active = pathname === n.to;
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors " +
                  (active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground")
                }
              >
                <Icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto p-3 border-t border-border">
          <div
            className={
              "flex items-center gap-2 rounded-md px-3 py-2 text-xs " +
              (offline
                ? "bg-destructive/10 text-destructive"
                : connected
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  : "bg-muted text-muted-foreground")
            }
          >
            <span
              className={
                "h-2 w-2 rounded-full " +
                (offline ? "bg-destructive" : connected ? "bg-emerald-500" : "bg-muted-foreground")
              }
            />
            {offline ? "Backend offline" : connected ? "Backend connected" : "Connecting…"}
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-card flex items-center px-4 md:hidden overflow-x-auto">
          <div className="flex gap-1">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className={
                  "rounded-md px-3 py-1.5 text-sm whitespace-nowrap " +
                  (pathname === n.to
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground")
                }
              >
                {n.label.split(" ")[0]}
              </Link>
            ))}
          </div>
        </header>
        <main className="flex-1 p-6 md:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
