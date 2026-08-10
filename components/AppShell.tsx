"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChatIcon,
  DatabaseIcon,
  HomeIcon,
  LogoIcon,
  PlusIcon,
  SearchIcon,
} from "@/components/icons";

const navigation = [
  { href: "/", label: "Overview", icon: HomeIcon },
  { href: "/ask", label: "Ask Brainbase", icon: ChatIcon },
  { href: "/knowledge", label: "Knowledge", icon: DatabaseIcon },
  { href: "/manage", label: "Add Knowledge", icon: PlusIcon },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <div className="flex min-h-screen flex-col bg-slate-100 text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-[1800px] items-center gap-4 px-4 sm:px-6 lg:px-8">
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
        </div>

        {/* Mobile / tablet nav */}
        <nav className="mx-auto flex w-full max-w-[1800px] gap-1.5 overflow-x-auto px-4 pb-3 sm:px-6 md:hidden lg:px-8">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-slate-950 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-teal-50 hover:text-teal-900"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

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
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    active
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

        <main className="min-w-0 flex-1 px-4 pb-16 pt-6 sm:px-6 sm:pt-8 lg:px-8">{children}</main>
      </div>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-[1800px] items-center justify-between gap-3 px-4 py-5 text-sm text-slate-500 sm:px-6 lg:px-8">
          <span className="font-medium text-slate-600">Brainbase</span>
          <span>Connected knowledge — relationships, not keywords.</span>
        </div>
      </footer>
    </div>
  );
}
