import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Battery, Eye, EyeOff, Loader2, Lock, Mail, Zap } from "lucide-react";
import { isAuthenticated, login } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — Gul Battery House" },
      { name: "description", content: "Gul Battery House POS login" },
    ],
  }),
  beforeLoad: () => {
    if (typeof window !== "undefined" && isAuthenticated()) {
      throw redirect({ to: "/" });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("inzimam@gmail.com");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate({ to: "/" });
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Login fail ho gaya");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-scene relative min-h-screen overflow-hidden flex items-center justify-center p-4">
      {/* Animated background */}
      <div className="login-orb login-orb-1" />
      <div className="login-orb login-orb-2" />
      <div className="login-orb login-orb-3" />
      <div className="login-grid" />

      <div
        className={
          "relative z-10 w-full max-w-md transition-all duration-700 " +
          (mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6")
        }
      >
        {/* Glass card */}
        <div className="login-glass rounded-3xl p-8 md:p-10 shadow-2xl">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="login-logo-ring mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-400/20 border border-amber-300/30">
              <Battery className="h-8 w-8 text-amber-300 login-pulse" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Gul Battery House
            </h1>
            <p className="mt-2 text-sm text-white/60 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-300" />
              Mobile Battery POS System
            </p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/70 uppercase tracking-wider">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="inzimam@gmail.com"
                  required
                  className="login-input w-full h-12 pl-10 pr-4 rounded-xl text-sm text-white placeholder:text-white/30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-white/70 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <input
                  type={showPass ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  required
                  className="login-input w-full h-12 pl-10 pr-11 rounded-xl text-sm text-white placeholder:text-white/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {err && (
              <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200 animate-in fade-in">
                {err}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="login-btn group relative w-full h-12 rounded-xl font-semibold text-sm text-slate-900 overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  "Sign In"
                )}
              </span>
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-white/40">
            Authorized staff only · Gul Battery House
          </p>
        </div>
      </div>
    </div>
  );
}
