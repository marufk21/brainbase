import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { buildKnowledgeGraph, knowledge } from "@/lib/knowledge";

export default function Home() {
  const graph = buildKnowledgeGraph();
  const recentProjects = knowledge.projects.slice(0, 3);

  return (
    <AppShell>
      <div className="max-w-6xl">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">
              Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal md:text-4xl">
              Knowledge Overview
            </h1>
            <p className="mt-2 max-w-2xl text-base leading-7 text-slate-600">
              Company knowledge connected across projects, people, clients, documents,
              decisions, and topics.
            </p>
          </div>
          <Link
            href="/ask"
            className="border border-slate-950 bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-800"
          >
            Ask Brainbase
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Projects", knowledge.projects.length],
            ["People", knowledge.people.length],
            ["Clients", knowledge.clients.length],
            ["Decisions", knowledge.decisions.length],
          ].map(([label, value]) => (
            <div key={label} className="border border-slate-200 bg-white p-5">
              <p className="text-sm font-medium text-slate-500">{label}</p>
              <p className="mt-3 text-4xl font-semibold">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
          <section className="border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold">Recent Projects</h2>
              <Link href="/knowledge?type=projects" className="text-sm font-semibold text-teal-800">
                View all
              </Link>
            </div>
            <div className="mt-4 grid gap-3">
              {recentProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/knowledge?type=projects&project=${project.id}`}
                  className="border border-slate-200 bg-slate-50 p-4 transition hover:border-teal-400 hover:bg-teal-50"
                >
                  <div className="flex flex-col justify-between gap-2 sm:flex-row">
                    <h3 className="font-semibold">{project.name}</h3>
                    <span className="text-sm text-slate-600">{project.status}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{project.description}</p>
                </Link>
              ))}
            </div>
          </section>

          <aside className="border border-slate-200 bg-white p-5">
            <h2 className="text-xl font-semibold">System Health</h2>
            <div className="mt-4 grid gap-3 text-sm">
              <p className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-600">Entities</span>
                <span className="font-semibold">{graph.nodes.length}</span>
              </p>
              <p className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-600">Relationships</span>
                <span className="font-semibold">{graph.edges.length}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-slate-600">Data source</span>
                <span className="font-semibold">Sample data</span>
              </p>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
