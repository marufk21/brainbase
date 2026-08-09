import Link from "next/link";

const navigation = [
  { href: "/", label: "Dashboard" },
  { href: "/knowledge", label: "Knowledge" },
  { href: "/explore", label: "Explore" },
  { href: "/manage", label: "Add / Edit" },
  { href: "/ask", label: "Ask AI" },
  { href: "/api-design", label: "API Design" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
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
              placeholder="Search company knowledge"
              className="h-10 w-full border border-slate-300 bg-slate-50 px-3 text-sm outline-none focus:border-teal-700"
            />
          </form>
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-[220px_1fr]">
        <aside className="border-b border-slate-200 bg-white lg:border-b-0 lg:border-r">
          <nav className="flex gap-2 overflow-x-auto p-3 lg:flex-col lg:p-4">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap border border-transparent px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <section className="p-5 lg:p-8">{children}</section>
      </div>
    </main>
  );
}
