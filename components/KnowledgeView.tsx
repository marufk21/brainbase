"use client";

import { useState } from "react";
import Link from "next/link";
import {
  buildKnowledgeGraph,
  getEntityRelationships,
  type EntityKind,
} from "@/lib/knowledge";
import { useKnowledge } from "@/components/knowledge-store";

const tabs = [
  { kind: "project", label: "Projects" },
  { kind: "person", label: "People" },
  { kind: "client", label: "Clients" },
  { kind: "decision", label: "Decisions" },
  { kind: "document", label: "Documents" },
  { kind: "topic", label: "Topics" },
] as const;

type TabKind = (typeof tabs)[number]["kind"];

const openableKinds: EntityKind[] = [
  "project",
  "person",
  "client",
  "decision",
  "document",
  "topic",
];

export function KnowledgeView({
  initialType,
  initialId,
}: {
  initialType: TabKind;
  initialId?: string;
}) {
  const { collections } = useKnowledge();
  const [type, setType] = useState<TabKind>(initialType);
  const [selectedId, setSelectedId] = useState<string | undefined>(initialId);

  const graph = buildKnowledgeGraph(collections);
  const nodesForType = graph.nodes.filter((node) => node.kind === type);
  const activeId = nodesForType.some((node) => node.id === selectedId)
    ? selectedId
    : nodesForType[0]?.id;
  const { entity, relationships } = getEntityRelationships(
    type,
    activeId ?? "",
    collections,
  );

  const openTarget = (kind: EntityKind, id: string) => {
    if (openableKinds.includes(kind)) {
      setType(kind as TabKind);
      setSelectedId(id);
    }
  };

  return (
    <div className="max-w-6xl">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">
            Knowledge
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal md:text-4xl">
            Browse company knowledge
          </h1>
          <p className="mt-2 max-w-2xl text-base leading-7 text-slate-600">
            Projects, people, clients, documents, decisions, and topics — and the
            relationships that connect them.
          </p>
        </div>
        <Link
          href="/manage"
          className="h-11 border border-slate-950 bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-teal-800"
        >
          + Add knowledge
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.kind}
            onClick={() => {
              setType(tab.kind);
              setSelectedId(undefined);
            }}
            className={`border px-3 py-2 text-sm font-semibold capitalize transition ${
              type === tab.kind
                ? "border-slate-950 bg-slate-950 text-white"
                : "border-slate-300 bg-white text-slate-700 hover:border-teal-500"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {nodesForType.length === 0 ? (
        <p className="mt-6 border border-slate-200 bg-white p-5 text-sm text-slate-500">
          No {type}s yet. Add one from Add Knowledge.
        </p>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[340px_1fr]">
          <aside className="grid gap-3 self-start">
            {nodesForType.map((node) => (
              <button
                key={node.id}
                onClick={() => setSelectedId(node.id)}
                className={`border p-4 text-left transition ${
                  node.id === entity?.id
                    ? "border-teal-500 bg-teal-50"
                    : "border-slate-200 bg-white hover:border-teal-300"
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-teal-700">
                  {node.kind}
                </p>
                <h2 className="mt-2 font-semibold">{node.label}</h2>
                {node.meta ? (
                  <p className="mt-1 text-sm text-slate-500">{node.meta}</p>
                ) : null}
              </button>
            ))}
          </aside>

          {entity ? (
            <article className="border border-slate-200 bg-white p-5">
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-teal-700">
                    {entity.kind}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">{entity.label}</h2>
                  <p className="mt-3 max-w-2xl text-base leading-7 text-slate-700">
                    {entity.summary}
                  </p>
                </div>
                <div className="flex flex-col items-start gap-2">
                  <span className="border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold">
                    {relationships.length} relationship
                    {relationships.length === 1 ? "" : "s"}
                  </span>
                  {(entity.kind === "decision" || entity.kind === "document") && (
                    <Link
                      href={`/manage?kind=${entity.kind}&id=${entity.id}`}
                      className="border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-teal-500"
                    >
                      Edit
                    </Link>
                  )}
                </div>
              </div>

              <section className="mt-6 border-t border-slate-200 pt-5">
                <h3 className="font-semibold">Relationships</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Direct links from the knowledge graph. Select an entity to follow it.
                </p>
                {relationships.length > 0 ? (
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {relationships.map((relationship, index) => (
                      <div key={index} className="border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-baseline gap-2 font-mono text-sm">
                          <span className="text-slate-400">
                            {relationship.direction === "outgoing" ? "├──" : "└──"}
                          </span>
                          <span className="text-teal-800">{relationship.label}</span>
                          <span className="text-slate-400">→</span>
                          <button
                            onClick={() =>
                              openTarget(relationship.target.kind, relationship.target.id)
                            }
                            className={`text-left font-semibold text-slate-950 underline decoration-slate-300 underline-offset-2 hover:text-teal-800 ${
                              openableKinds.includes(relationship.target.kind)
                                ? "cursor-pointer"
                                : "cursor-default"
                            }`}
                          >
                            {relationship.target.label}
                          </button>
                        </div>
                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                          {relationship.target.summary}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-slate-500">No linked records yet.</p>
                )}
              </section>
            </article>
          ) : null}
        </div>
      )}
    </div>
  );
}

