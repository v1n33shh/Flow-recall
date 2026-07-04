"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Something went wrong.");
      }

      // Sign in immediately after registering - no separate "now go log in" step.
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        throw new Error("Account created - please sign in.");
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  // Inline fractal-noise SVG for the cinematic film-grain overlay
  const NOISE_BACKGROUND =
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

  return (
    <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-16">
      {/* Faded spotlight grid */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />

      {/* Ambient glow orbs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden hidden md:block">
        <div className="absolute -top-40 left-1/2 h-[38rem] w-[38rem] -translate-x-1/2 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute top-1/3 -left-32 h-[30rem] w-[30rem] rounded-full bg-purple-600/5 blur-3xl" />
        <div className="absolute -bottom-24 right-[-8rem] h-[32rem] w-[32rem] rounded-full bg-gold/5 blur-3xl" />
      </div>

      {/* Cinematic film grain */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.03] hidden md:block"
        style={{ backgroundImage: NOISE_BACKGROUND }}
      />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-retro bg-gradient-to-br from-amber-100 via-gold to-amber-500 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Free forever. No credit card, no Google, no friction.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 rounded-3xl border border-white/10 bg-white/[0.02] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-2xl sm:p-8"
        >
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Email
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-3.5 text-sm text-zinc-100 placeholder-zinc-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] outline-none transition-all focus:border-gold focus:ring-1 focus:ring-gold"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-3.5 text-sm text-zinc-100 placeholder-zinc-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] outline-none transition-all focus:border-gold focus:ring-1 focus:ring-gold"
            />
          </div>

          {error && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-3.5 text-sm font-medium text-red-400 backdrop-blur-md">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-full bg-zinc-100 px-6 py-4 text-sm font-semibold text-black shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-200 hover:scale-[1.02] hover:bg-white active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-gold hover:text-gold/80 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
