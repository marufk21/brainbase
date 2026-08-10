"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { href: "/", label: "Overview" },
  { href: "/ask", label: "Ask Brainbase" },
  { href: "/knowledge", label: "Knowledge" },
  { href: "/manage", label: "Add Knowledge" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="flex h-16 items-center justify-between px-5 lg:px-8">
          <Link href="/" className="text-xl font-semibold">
            Brainbase
          </Link>
          <form action="/ask" className="hidden w-full max-w-sm md:block">
            <input
              name="q"
              placeholder="Ask Brainbase a question"
              className="h-10 w-full border border-slate-300 bg-slate-50 px-3 text-sm outline-none focus:border-teal-700"
            />
          </form>
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-[220px_1fr]">
        <aside className="border-b border-slate-200 bg-white lg:border-b-0 lg:border-r">
          <nav className="flex gap-2 overflow-x-auto p-3 lg:flex-col lg:p-4">
            {navigation.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`whitespace-nowrap border px-3 py-2 text-sm font-medium transition ${
                    active
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-transparent text-slate-700 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-900"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <section className="p-5 lg:p-8">{children}</section>
      </div>
    </main>
  );
}
