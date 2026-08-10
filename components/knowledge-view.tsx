"use client";

import { useState } from "react";
import Link from "next/link";
import { buildKnowledgeGraph, getEntityRelationships, type EntityKind } from "@/lib/knowledge";
import { useKnowledge } from "@/components/knowledge-store";
import { DatabaseIcon, LinkIcon, PlusIcon } from "@/components/icons";

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
  const { entity, relationships } = getEntityRelationships(type, activeId ?? "", collections);

  const openTarget = (kind: EntityKind, id: string) => {
    if (openableKinds.includes(kind)) {
      setType(kind as TabKind);
      setSelectedId(id);
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-teal-700 ring-1 ring-teal-100">
            <DatabaseIcon className="h-3.5 w-3.5" />
            Knowledge
          </p>
          <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            Browse company knowledge
          </h1>
          <p className="mt-2 max-w-2xl text-base leading-7 text-slate-600">
            Projects, people, clients, documents, decisions, and topics — and the relationships that
            connect them.
          </p>
        </div>
        <Link
          href="/manage"
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 sm:self-auto"
        >
          <PlusIcon className="h-4 w-4" />
          Add knowledge
        </Link>
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const count = graph.nodes.filter((node) => node.kind === tab.kind).length;
          const active = type === tab.kind;
          return (
            <button
              key={tab.kind}
              onClick={() => {
                setType(tab.kind);
                setSelectedId(undefined);
              }}
              className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
                active
                  ? "bg-slate-950 text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-teal-400 hover:text-teal-900"
              }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[11px] font-bold leading-none ${
                  active ? "bg-teal-500/25 text-teal-200" : "bg-slate-100 text-slate-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {nodesForType.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
          No {type}s yet. Add one from Add Knowledge.
        </p>
      ) : (
        <div className="mt-6 grid items-start gap-5 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
          {/* Entity list */}
          <aside className="grid gap-2.5 lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:pr-1">
            {nodesForType.map((node) => {
              const active = node.id === entity?.id;
              return (
                <button
                  key={node.id}
                  onClick={() => setSelectedId(node.id)}
                  className={`rounded-xl border p-4 text-left shadow-sm transition ${
                    active
                      ? "border-teal-500 bg-teal-50/70 ring-2 ring-teal-500/20"
                      : "border-slate-200 bg-white hover:border-teal-300"
                  }`}
                >
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-teal-700">
                    {node.kind}
                  </p>
                  <h2 className="mt-1.5 font-semibold leading-snug">{node.label}</h2>
                  {node.meta ? (
                    <p className="mt-1 line-clamp-1 text-sm text-slate-500">{node.meta}</p>
                  ) : null}
                </button>
              );
            })}
          </aside>

          {/* Entity detail */}
          {entity ? (
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-teal-700">
                    {entity.kind}
                  </p>
                  <h2 className="mt-1.5 text-xl font-bold leading-snug sm:text-2xl">
                    {entity.label}
                  </h2>
                  <p className="mt-3 max-w-2xl text-base leading-7 text-slate-700">
                    {entity.summary}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="rounded-full bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-600 ring-1 ring-slate-200">
                    {relationships.length} relationship
                    {relationships.length === 1 ? "" : "s"}
                  </span>
                  {openableKinds.includes(entity.kind) && (
                    <Link
                      href={`/manage?kind=${entity.kind}&id=${entity.id}`}
                      className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-teal-500 hover:text-teal-900"
                    >
                      Edit
                    </Link>
                  )}
                </div>
              </div>

              <section className="mt-6 border-t border-slate-100 pt-5">
                <h3 className="flex items-center gap-2 font-semibold">
                  <LinkIcon className="h-4 w-4 text-teal-700" />
                  Relationships
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Direct links from the knowledge graph. Select an entity to follow it.
                </p>
                {relationships.length > 0 ? (
                  <div className="mt-4 grid gap-3 md:grid-cols-2 min-[1700px]:grid-cols-3">
                    {relationships.map((relationship, index) => (
                      <div
                        key={index}
                        className="rounded-xl border border-slate-200 bg-slate-50/70 p-4"
                      >
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 font-mono text-sm">
                          <span className="text-teal-700">{relationship.label}</span>
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
