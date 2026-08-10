"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/auth-guard";
import {
  ChatIcon,
  CloseIcon,
  DatabaseIcon,
  HomeIcon,
  LogoIcon,
  LogoutIcon,
  MenuIcon,
  PlusIcon,
  SearchIcon,
} from "@/components/icons";
import { useAuth } from "@/hooks/use-auth";
import { LOGIN_PATH } from "@/lib/auth";

const navigation = [
  { href: "/", label: "Overview", icon: HomeIcon },
  { href: "/ask", label: "Ask Brainbase", icon: ChatIcon },
  { href: "/knowledge", label: "Knowledge", icon: DatabaseIcon },
  { href: "/manage", label: "Add Knowledge", icon: PlusIcon },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <AppShellLayout>{children}</AppShellLayout>
    </AuthGuard>
  );
}

function AppShellLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, logout } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Lock body scroll and close on Escape while the mobile sidebar is open
  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileNavOpen(false);
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileNavOpen]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const initials = session
    ? session.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
    : "";

  const handleLogout = () => {
    logout();
    router.replace(LOGIN_PATH);
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-100 text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-[1800px] items-center gap-3 px-4 sm:gap-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open navigation"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-950 md:hidden"
          >
            <MenuIcon className="h-5 w-5" />
          </button>
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-teal-500 to-teal-800 text-white shadow-sm">
              <LogoIcon className="h-5 w-5" />
            </span>
            <span className="text-lg font-bold tracking-tight">Brainbase</span>
          </Link>

          <form action="/ask" className="relative ml-auto hidden w-full max-w-md md:block">
            <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              name="q"
              placeholder="Ask Brainbase a question…"
              className="h-10 w-full rounded-full border border-slate-200 bg-slate-100/80 pl-10 pr-4 text-sm outline-none transition focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/20"
            />
          </form>

          {session && (
            <div className="ml-auto flex shrink-0 items-center gap-2 md:ml-4">
              <div
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3 shadow-sm"
                title={`Signed in as ${session.email} (demo session)`}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-linear-to-br from-teal-500 to-teal-800 text-[11px] font-bold text-white">
                  {initials}
                </span>
                <span className="hidden text-sm font-medium text-slate-700 sm:block">
                  {session.name}
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-600 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
              >
                <LogoutIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Log out</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Mobile sidebar */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileNavOpen(false)}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]"
          />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-white shadow-2xl">
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 px-4">
              <Link
                href="/"
                onClick={() => setMobileNavOpen(false)}
                className="flex items-center gap-2.5"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-teal-500 to-teal-800 text-white shadow-sm">
                  <LogoIcon className="h-5 w-5" />
                </span>
                <span className="text-lg font-bold tracking-tight">Brainbase</span>
              </Link>
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                aria-label="Close navigation"
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex flex-1 flex-col gap-1.5 overflow-y-auto px-4 py-6">
              <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                Workspace
              </p>
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileNavOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active
                      ? "bg-slate-950 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-teal-900"
                      }`}
                  >
                    <Icon
                      className={`h-[18px] w-[18px] ${active ? "text-teal-300" : "text-slate-400"}`}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {session && (
              <div className="flex shrink-0 items-center justify-between gap-2 border-t border-slate-200/80 px-4 py-4">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-teal-500 to-teal-800 text-[11px] font-bold text-white">
                    {initials}
                  </span>
                  <span className="truncate text-sm font-medium text-slate-700">
                    {session.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                >
                  <LogoutIcon className="h-4 w-4" />
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mx-auto flex w-full max-w-[1800px] flex-1">
        {/* Desktop sidebar */}
        <aside className="hidden w-60 shrink-0 md:block">
          <nav className="sticky top-24 flex flex-col gap-1.5 px-4 py-8 lg:px-6">
            <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              Workspace
            </p>
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active
                    ? "bg-slate-950 text-white shadow-sm"
                    : "text-slate-600 hover:bg-white hover:text-teal-900 hover:shadow-sm"
                    }`}
                >
                  <Icon
                    className={`h-[18px] w-[18px] ${active ? "text-teal-300" : "text-slate-400"}`}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 px-4 pb-8 pt-6 sm:px-6 sm:pt-8 lg:px-8">{children}</main>
      </div>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-1 px-4 py-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-6 lg:px-8">
          <span className="font-medium text-slate-600">Brainbase</span>
          <span>Connected knowledge — relationships, not keywords.</span>
        </div>
      </footer>
    </div>
  );
}
