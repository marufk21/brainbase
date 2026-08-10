"use client";

import Link from "next/link";
import { useKnowledge } from "@/components/knowledge-store";

export function HomeView() {
  const { collections } = useKnowledge();

  const recentDecisions = [...collections.decisions]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 4);
  const recentDocuments = collections.documents.slice(0, 4);

  return (
    <div className="max-w-4xl">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">
        Overview
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-normal md:text-4xl">
        Brainbase
      </h1>
      <p className="mt-2 max-w-2xl text-base leading-7 text-slate-600">
        The connected knowledge base for projects, people, clients, documents,
        decisions, and topics. Ask questions and get answers grounded in
        relationships — not keyword search.
      </p>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Link
          href="/ask"
          className="flex flex-col justify-between gap-4 border border-slate-950 bg-slate-950 p-6 transition hover:bg-teal-800"
        >
          <div>
            <h2 className="text-2xl font-semibold text-white">Ask Brainbase</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Ask anything about what we know — get an answer with evidence and the
              relationship path behind it.
            </p>
          </div>
          <span className="text-sm font-semibold text-teal-300">Ask a question →</span>
        </Link>

        <div className="grid gap-4">
          <Link
            href="/knowledge"
            className="border border-slate-200 bg-white p-5 transition hover:border-teal-400 hover:bg-teal-50"
          >
            <h2 className="text-lg font-semibold">Knowledge</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Browse {collections.projects.length} projects, {collections.people.length}{" "}
              people, {collections.clients.length} clients, and{" "}
              {collections.decisions.length} decisions.
            </p>
          </Link>
          <Link
            href="/manage"
            className="border border-slate-200 bg-white p-5 transition hover:border-teal-400 hover:bg-teal-50"
          >
            <h2 className="text-lg font-semibold">Add Knowledge</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Record a decision or a note and link it to the rest of the knowledge.
            </p>
          </Link>
        </div>
      </div>

      <section className="mt-6 border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">Recent decisions</h2>
          <Link
            href="/knowledge?type=decision"
            className="text-sm font-semibold text-teal-800"
          >
            View all
          </Link>
        </div>
        <div className="mt-4 grid gap-3">
          {recentDecisions.map((decision) => (
            <Link
              key={decision.id}
              href={`/knowledge?type=decision&id=${decision.id}`}
              className="flex flex-col justify-between gap-1 border border-slate-200 bg-slate-50 p-4 transition hover:border-teal-400 hover:bg-teal-50 sm:flex-row sm:items-start"
            >
              <span className="font-semibold">{decision.title}</span>
              <span className="text-sm text-slate-600">{decision.date}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-6 border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">Recent documents</h2>
          <Link
            href="/knowledge?type=document"
            className="text-sm font-semibold text-teal-800"
          >
            View all
          </Link>
        </div>
        <div className="mt-4 grid gap-3">
          {recentDocuments.map((document) => (
            <Link
              key={document.id}
              href={`/knowledge?type=document&id=${document.id}`}
              className="border border-slate-200 bg-slate-50 p-4 transition hover:border-teal-400 hover:bg-teal-50"
            >
              <span className="font-semibold">{document.label}</span>
              <p className="mt-1 text-sm text-slate-600">{document.summary}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
