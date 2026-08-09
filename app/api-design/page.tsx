import { AppShell } from "@/components/AppShell";

const endpointGroups = [
  {
    title: "Knowledge CRUD",
    description: "Generic endpoints for people, projects, clients, documents, decisions, and topics.",
    endpoints: [
      ["GET", "/api/knowledge/:type", "List records by entity type"],
      ["POST", "/api/knowledge/:type", "Create a new record"],
      ["GET", "/api/knowledge/:type/:id", "Get one record"],
      ["PATCH", "/api/knowledge/:type/:id", "Update one record"],
      ["DELETE", "/api/knowledge/:type/:id", "Delete one record"],
    ],
  },
  {
    title: "Relationships",
    description: "Return direct graph connections for one entity.",
    endpoints: [["GET", "/api/relationships/:type/:id", "Show linked people, decisions, documents, topics, and clients"]],
  },
  {
    title: "Explore",
    description: "Return an aggregated UI-friendly view around one entity.",
    endpoints: [["GET", "/api/explore/:type/:id", "Build detail screen context for an entity"]],
  },
  {
    title: "Ask",
    description: "Answer natural-language questions using graph relationships and evidence.",
    endpoints: [["POST", "/api/ask", "Return answer, evidence, sources, and relationship path"]],
  },
  {
    title: "Stats",
    description: "Power dashboard counters and system overview.",
    endpoints: [["GET", "/api/stats", "Return entity and relationship counts"]],
  },
];

const flowSteps = [
  "User Question",
  "Question Understanding",
  "Identify Entities",
  "Find Relationships",
  "Traverse Graph",
  "Collect Evidence",
  "Generate Answer",
];

export default function ApiDesignPage() {
  return (
    <AppShell>
      <div className="max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">
          API Design
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal md:text-4xl">
          Endpoint plan for Brainbase
        </h1>
        <p className="mt-2 max-w-3xl text-base leading-7 text-slate-600">
          This UI shows the planned backend contract for CRUD, relationships,
          exploration, dashboard stats, and relationship-aware Q&A.
        </p>

        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          <InfoCard title="Endpoint Patterns" value="9" />
          <InfoCard title="Entity Types" value="6" />
          <InfoCard title="Core Feature" value="Q&A" />
        </section>

        <section className="mt-6 grid gap-4">
          {endpointGroups.map((group) => (
            <article key={group.title} className="border border-slate-200 bg-white p-5">
              <div className="flex flex-col justify-between gap-2 md:flex-row md:items-start">
                <div>
                  <h2 className="text-xl font-semibold">{group.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {group.description}
                  </p>
                </div>
                <span className="border border-teal-200 bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-900">
                  {group.endpoints.length} pattern{group.endpoints.length > 1 ? "s" : ""}
                </span>
              </div>

              <div className="mt-4 overflow-hidden border border-slate-200">
                {group.endpoints.map(([method, path, purpose]) => (
                  <div
                    key={`${method}-${path}`}
                    className="grid gap-2 border-b border-slate-200 bg-slate-50 p-3 last:border-b-0 md:grid-cols-[90px_1fr_1.2fr]"
                  >
                    <span className={`text-sm font-bold ${methodTone(method)}`}>
                      {method}
                    </span>
                    <code className="text-sm font-semibold text-slate-950">{path}</code>
                    <span className="text-sm text-slate-600">{purpose}</span>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <article className="border border-slate-200 bg-white p-5">
            <h2 className="text-xl font-semibold">Architecture</h2>
            <div className="mt-4 grid gap-3 text-sm">
              {["UI", "API Layer", "Knowledge Service", "Graph Engine", "Q&A Engine", "Knowledge Store"].map(
                (item, index) => (
                  <div key={item} className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center border border-slate-300 bg-slate-50 font-semibold">
                      {index + 1}
                    </span>
                    <span className="font-medium text-slate-800">{item}</span>
                  </div>
                ),
              )}
            </div>
          </article>

          <article className="border border-slate-200 bg-white p-5">
            <h2 className="text-xl font-semibold">Q&A Flow</h2>
            <div className="mt-4 grid gap-2">
              {flowSteps.map((step, index) => (
                <div key={step} className="border border-slate-200 bg-slate-50 p-3 text-sm">
                  <span className="font-semibold text-teal-800">{index + 1}. </span>
                  {step}
                </div>
              ))}
            </div>
          </article>
        </section>
      </div>
    </AppShell>
  );
}

function InfoCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="border border-slate-200 bg-white p-5">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
    </div>
  );
}

function methodTone(method: string) {
  if (method === "GET") {
    return "text-blue-700";
  }

  if (method === "POST") {
    return "text-emerald-700";
  }

  if (method === "PATCH") {
    return "text-amber-700";
  }

  return "text-rose-700";
}
