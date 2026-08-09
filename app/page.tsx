import { answerQuestion, buildKnowledgeGraph, knowledge } from "@/lib/knowledge";

const sampleQuestions = [
  "Who worked on the Lexora project and what key decisions were made about its approach?",
  "What did we learn from the FinEdge project that is useful for Lexora?",
  "Show me everything related to the decision about not integrating Slack in the internal knowledge base.",
];

const nodeTone = {
  client: "border-teal-200 bg-teal-50 text-teal-900",
  project: "border-blue-200 bg-blue-50 text-blue-950",
  person: "border-amber-200 bg-amber-50 text-amber-950",
  decision: "border-rose-200 bg-rose-50 text-rose-950",
  topic: "border-violet-200 bg-violet-50 text-violet-950",
  document: "border-slate-200 bg-slate-50 text-slate-950",
  message: "border-emerald-200 bg-emerald-50 text-emerald-950",
};

export default async function Home(props: PageProps<"/">) {
  const searchParams = await props.searchParams;
  const question = typeof searchParams.q === "string" ? searchParams.q : sampleQuestions[0];
  const selectedKind = typeof searchParams.kind === "string" ? searchParams.kind : "all";
  const response = answerQuestion(question);
  const graph = buildKnowledgeGraph();
  const visibleNodes =
    selectedKind === "all"
      ? graph.nodes
      : graph.nodes.filter((node) => node.kind === selectedKind);
  const visibleNodeIds = new Set(visibleNodes.map((node) => node.id));
  const visibleEdges = graph.edges.filter(
    (edge) => visibleNodeIds.has(edge.from) || visibleNodeIds.has(edge.to),
  );

  return (
    <main className="min-h-screen bg-[#f7f4ee] text-slate-950">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
              Brainbase
            </p>
            <h1 className="mt-3 max-w-4xl text-4xl font-semibold leading-tight tracking-normal text-slate-950 md:text-6xl">
              Connected memory for a small AI consulting team
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-650">
              Store clients, projects, people, documents, decisions, and topics as a
              relationship graph, then answer questions by walking those links.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 self-end">
            {[
              ["Entities", graph.nodes.length],
              ["Relationships", graph.edges.length],
              ["Projects", knowledge.projects.length],
              ["Decisions", knowledge.decisions.length],
            ].map(([label, value]) => (
              <div key={label} className="border border-slate-200 bg-slate-50 p-4">
                <div className="text-3xl font-semibold">{value}</div>
                <div className="mt-1 text-sm text-slate-600">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
        <div className="border border-slate-200 bg-white p-5">
          <h2 className="text-2xl font-semibold">Ask through relationships</h2>
          <form className="mt-4 flex flex-col gap-3" action="/">
            <textarea
              name="q"
              defaultValue={question}
              rows={4}
              className="w-full resize-none border border-slate-300 bg-white p-3 text-base leading-7 outline-none focus:border-teal-700"
            />
            <button className="h-11 border border-slate-950 bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-teal-800">
              Answer question
            </button>
          </form>
          <div className="mt-4 grid gap-2">
            {sampleQuestions.map((sample) => (
              <a
                key={sample}
                href={`/?q=${encodeURIComponent(sample)}&kind=${selectedKind}`}
                className="border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700 transition hover:border-teal-500 hover:bg-teal-50"
              >
                {sample}
              </a>
            ))}
          </div>
        </div>

        <div className="border border-slate-200 bg-white p-5">
          <h2 className="text-2xl font-semibold">{response.title}</h2>
          <p className="mt-3 text-base leading-7 text-slate-700">{response.answer}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {response.path.map((step) => (
              <span key={step} className="border border-teal-200 bg-teal-50 px-3 py-1 text-sm text-teal-900">
                {step}
              </span>
            ))}
          </div>
          <div className="mt-5 grid gap-2">
            {response.evidence.map((item) => (
              <p key={item} className="border-l-2 border-amber-500 bg-amber-50 px-3 py-2 text-sm leading-6 text-amber-950">
                {item}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-8 lg:px-8">
        <div className="flex flex-col justify-between gap-4 border-y border-slate-300 py-5 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-semibold">Knowledge graph</h2>
            <p className="mt-1 text-sm text-slate-600">
              Filter entities, then inspect the relationships that keep context intact.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {["all", "project", "decision", "person", "topic", "document", "message"].map((kind) => (
              <a
                key={kind}
                href={`/?q=${encodeURIComponent(question)}&kind=${kind}`}
                className={`border px-3 py-2 text-sm font-medium capitalize ${
                  selectedKind === kind
                    ? "border-slate-950 bg-slate-950 text-white"
                    : "border-slate-300 bg-white text-slate-700"
                }`}
              >
                {kind}
              </a>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_360px]">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {visibleNodes.map((node) => (
              <article key={node.id} className={`border p-4 ${nodeTone[node.kind]}`}>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold leading-6">{node.label}</h3>
                  <span className="text-xs font-semibold uppercase">{node.kind}</span>
                </div>
                {node.meta ? <p className="mt-1 text-xs opacity-75">{node.meta}</p> : null}
                <p className="mt-3 text-sm leading-6 opacity-85">{node.summary}</p>
              </article>
            ))}
          </div>

          <aside className="border border-slate-200 bg-white p-4">
            <h3 className="font-semibold">Visible relationship paths</h3>
            <div className="mt-3 grid gap-2">
              {visibleEdges.slice(0, 24).map((edge, index) => {
                const from = graph.nodes.find((node) => node.id === edge.from)?.label ?? edge.from;
                const to = graph.nodes.find((node) => node.id === edge.to)?.label ?? edge.to;
                return (
                  <p key={`${edge.from}-${edge.to}-${index}`} className="border border-slate-200 bg-slate-50 p-2 text-xs leading-5 text-slate-700">
                    <span className="font-semibold text-slate-950">{from}</span> {edge.label}{" "}
                    <span className="font-semibold text-slate-950">{to}</span>
                  </p>
                );
              })}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
