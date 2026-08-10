"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogoIcon } from "@/components/icons";
import { useAuth } from "@/hooks/useAuth";
import { DEMO_ACCOUNT, HOME_PATH, isAuthenticated } from "@/lib/auth";

/**
 * Demo login form. Credentials are validated locally in the browser only —
 * nothing is sent to any API. This is not production-grade authentication.
 */
export function LoginView() {
  const { session, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Already signed in? Skip the login page. Re-reads sessionStorage directly
  // so it also works right after hydration.
  useEffect(() => {
    if (isAuthenticated()) {
      router.replace(HOME_PATH);
    }
  }, [session, router]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = login(email, password);
    if (result.ok) {
      setError(null);
      router.replace(HOME_PATH);
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-teal-200/40 blur-3xl"
      />

      <div className="relative w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-teal-500 to-teal-800 text-white shadow-sm">
            <LogoIcon className="h-5 w-5" />
          </span>
          <span className="text-xl font-bold tracking-tight">Brainbase</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold tracking-tight">Sign in</h1>


          <form onSubmit={handleSubmit} className="mt-6 grid gap-4" noValidate>
            <div className="grid gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-100/80 px-4 text-sm outline-none transition focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            <div className="grid gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••••••"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-100/80 px-4 text-sm outline-none transition focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              className="mt-1 inline-flex h-11 items-center justify-center rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              Log in
            </button>
          </form>

          <div className="mt-6 rounded-xl border border-teal-100 bg-teal-50/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">
              Demo account
            </p>
            <dl className="mt-2 grid gap-1 text-sm text-slate-700">
              <div className="flex items-baseline gap-2">
                <dt className="w-16 shrink-0 font-medium text-slate-500">Email</dt>
                <dd className="font-mono">{DEMO_ACCOUNT.email}</dd>
              </div>
              <div className="flex items-baseline gap-2">
                <dt className="w-16 shrink-0 font-medium text-slate-500">Password</dt>
                <dd className="font-mono">{DEMO_ACCOUNT.password}</dd>
              </div>
            </dl>
          </div>
        </div>


      </div>
    </div>
  );
}
