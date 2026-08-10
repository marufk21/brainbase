"use client";

import Link from "next/link";
import { useKnowledge } from "@/components/knowledge-store";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  DocumentIcon,
  PlusIcon,
  SparkleIcon,
} from "@/components/icons";

export function HomeView() {
  const { collections } = useKnowledge();

  const recentDecisions = [...collections.decisions]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 4);
  const recentDocuments = collections.documents.slice(0, 4);

  const stats = [
    { label: "Projects", value: collections.projects.length },
    { label: "People", value: collections.people.length },
    { label: "Clients", value: collections.clients.length },
    { label: "Decisions", value: collections.decisions.length },
    { label: "Documents", value: collections.documents.length },
    { label: "Topics", value: collections.topics.length },
  ];

  return (
    <div className="w-full">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-teal-200/40 blur-3xl"
        />
        <p className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-teal-700 ring-1 ring-teal-100">
          <SparkleIcon className="h-3.5 w-3.5" />
          Overview
        </p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          Your company knowledge,{" "}
          <span className="bg-gradient-to-r from-teal-600 to-teal-800 bg-clip-text text-transparent">
            connected
          </span>
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
          The connected knowledge base for projects, people, clients, documents, decisions, and
          topics. Ask questions and get answers grounded in relationships — not keyword search.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5 text-center"
            >
              <p className="text-xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-xs font-medium text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Primary actions */}
      <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Link
          href="/ask"
          className="group relative flex flex-col justify-between gap-6 overflow-hidden rounded-2xl bg-slate-950 p-6 shadow-sm transition hover:shadow-lg sm:p-7"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-teal-500/25 blur-3xl transition group-hover:bg-teal-400/30"
          />
          <div className="relative">
            <h2 className="text-2xl font-bold text-white">Ask Brainbase</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Ask anything about what we know — get an answer with evidence and the relationship
              path behind it.
            </p>
          </div>
          <span className="relative inline-flex items-center gap-2 self-start rounded-full bg-teal-500/15 px-4 py-2 text-sm font-semibold text-teal-300 ring-1 ring-teal-400/30 transition group-hover:bg-teal-500/25">
            Ask a question
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>

        <div className="grid gap-4">
          <Link
            href="/knowledge"
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md"
          >
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-700 ring-1 ring-teal-100">
                <SparkleIcon className="h-4 w-4" />
              </span>
              Knowledge
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Browse {collections.projects.length} projects, {collections.people.length} people,{" "}
              {collections.clients.length} clients, and {collections.decisions.length} decisions.
            </p>
          </Link>
          <Link
            href="/manage"
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md"
          >
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-700 ring-1 ring-teal-100">
                <PlusIcon className="h-4 w-4" />
              </span>
              Add Knowledge
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Record a decision or a note and link it to the rest of the knowledge.
            </p>
          </Link>
        </div>
      </div>

      {/* Recent activity */}
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <CheckCircleIcon className="h-5 w-5 text-teal-700" />
              Recent decisions
            </h2>
            <Link
              href="/knowledge?type=decision"
              className="inline-flex items-center gap-1 text-sm font-semibold text-teal-800 hover:text-teal-600"
            >
              View all
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-4 grid gap-2.5">
            {recentDecisions.map((decision) => (
              <Link
                key={decision.id}
                href={`/knowledge?type=decision&id=${decision.id}`}
                className="flex flex-col justify-between gap-1.5 rounded-xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-teal-300 hover:bg-teal-50/60 sm:flex-row sm:items-center sm:gap-4"
              >
                <span className="min-w-0 font-medium leading-6 text-slate-800">
                  {decision.title}
                </span>
                <span className="shrink-0 self-start rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200 sm:self-auto">
                  {decision.date}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <DocumentIcon className="h-5 w-5 text-teal-700" />
              Recent documents
            </h2>
            <Link
              href="/knowledge?type=document"
              className="inline-flex items-center gap-1 text-sm font-semibold text-teal-800 hover:text-teal-600"
            >
              View all
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-4 grid gap-2.5">
            {recentDocuments.map((document) => (
              <Link
                key={document.id}
                href={`/knowledge?type=document&id=${document.id}`}
                className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-teal-300 hover:bg-teal-50/60"
              >
                <span className="font-medium text-slate-800">{document.label}</span>
                <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">
                  {document.summary}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
