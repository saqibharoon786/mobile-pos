import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
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
  LogOut,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useApiStatus } from "@/lib/pos-store";
import { getAuthUser, isAuthenticated, logout } from "@/lib/auth";

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
  const navigate = useNavigate();
  const { connected, offline } = useApiStatus();
  const [ready, setReady] = useState(false);
  const user = getAuthUser();

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready && !isAuthenticated()) {
      navigate({ to: "/login" });
    }
  }, [ready, navigate]);

  function handleLogout() {
    logout();
    navigate({ to: "/login" });
  }

  if (!ready || !isAuthenticated()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <aside className="w-64 border-r border-border bg-card hidden md:flex flex-col">
        <div className="h-16 flex items-center gap-2 px-5 border-b border-border">
          <div className="h-9 w-9 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-sm">
            <BatteryFull className="h-5 w-5" />
          </div>
          <div>
            <div className="font-semibold leading-tight">Gul Battery House</div>
            <div className="text-xs text-muted-foreground">Mobile batteries</div>
          </div>
        </div>
        <nav className="p-3 flex flex-col gap-1 overflow-auto flex-1">
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
        <div className="p-3 border-t border-border space-y-2">
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
          {user && (
            <div className="px-3 py-1 text-xs text-muted-foreground truncate">{user.email}</div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 md:hidden">
          <div className="font-semibold text-sm truncate">Gul Battery House</div>
          <button
            onClick={handleLogout}
            className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1"
          >
            <LogOut className="h-3.5 w-3.5" /> Logout
          </button>
        </header>
        <header className="hidden md:flex h-0" />
        <div className="md:hidden overflow-x-auto border-b border-border bg-card px-2 py-2">
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
        </div>
        <main className="flex-1 p-6 md:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
