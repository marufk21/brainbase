  import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { buildKnowledgeGraph, getEntityRelationships } from "@/lib/knowledge";
import type { EntityKind } from "@/lib/knowledge";

const selectableTypes: EntityKind[] = [
  "project",
  "person",
  "client",
  "decision",
  "document",
  "topic",
];

export default async function ExplorePage(props: PageProps<"/explore">) {
  const searchParams = await props.searchParams;
  const graph = buildKnowledgeGraph();
  const selectedType = selectableTypes.includes(searchParams.type as EntityKind)
    ? (searchParams.type as EntityKind)
    : "project";
  const nodesForType = graph.nodes.filter((node) => node.kind === selectedType);
  const selectedId =
    typeof searchParams.id === "string" ? searchParams.id : nodesForType[0]?.id;
  const { entity, relationships } = getEntityRelationships(selectedType, selectedId);

  return (
    <AppShell>
      <div className="max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">
          Explore
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal md:text-4xl">
          Connected entities
        </h1>
        <p className="mt-2 max-w-2xl text-base leading-7 text-slate-600">
          Select any entity and inspect direct relationships from the knowledge graph.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {selectableTypes.map((type) => (
            <Link
              key={type}
              href={`/explore?type=${type}`}
              className={`border px-3 py-2 text-sm font-semibold capitalize ${
                selectedType === type
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:border-teal-500"
              }`}
            >
              {type}
            </Link>
          ))}
        </div>

        <section className="mt-6 grid gap-6 lg:grid-cols-[340px_1fr]">
          <aside className="grid gap-3 self-start">
            {nodesForType.map((node) => (
              <Link
                key={node.id}
                href={`/explore?type=${selectedType}&id=${node.id}`}
                className={`border p-4 transition ${
                  node.id === entity.id
                    ? "border-teal-500 bg-teal-50"
                    : "border-slate-200 bg-white hover:border-teal-300"
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-teal-700">
                  {node.kind}
                </p>
                <h2 className="mt-2 font-semibold">{node.label}</h2>
                {node.meta ? <p className="mt-1 text-sm text-slate-500">{node.meta}</p> : null}
              </Link>
            ))}
          </aside>

          <article className="border border-slate-200 bg-white p-5">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-teal-700">
                  Selected {entity.kind}
                </p>
                <h2 className="mt-2 text-2xl font-semibold">{entity.label}</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                  {entity.summary}
                </p>
              </div>
              <span className="border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold">
                {relationships.length} links
              </span>
            </div>

            <div className="mt-6 border-t border-slate-200 pt-5">
              <h3 className="font-semibold">Connected entities</h3>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {relationships.map((relationship) => (
                  <div
                    key={`${relationship.label}-${relationship.target.id}`}
                    className="border border-slate-200 bg-slate-50 p-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      {relationship.direction === "outgoing" ? "Connects to" : "Connected from"}
                    </p>
                    <h4 className="mt-2 font-semibold">{relationship.target.label}</h4>
                    <p className="mt-1 text-sm text-teal-800">{relationship.label}</p>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                      {relationship.target.summary}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </article>
        </section>
      </div>
    </AppShell>
  );
}
