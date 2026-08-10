"use client";

import { useState } from "react";
import { answerQuestion, sampleQuestions } from "@/lib/knowledge";
import { useAsk } from "@/hooks/use-ask";
import { useKnowledge } from "@/components/knowledge-store";
import { ChatIcon, DocumentIcon, LinkIcon, SparkleIcon } from "@/components/icons";

export function AskView({ initialQuestion }: { initialQuestion: string }) {
  const { collections } = useKnowledge();
  const { remote, isLoading, error, ask: askRemote } = useAsk();
  // The answer only appears after an explicit "Ask Brainbase" submit.
  // Deep links (/ask?q=...) and suggested questions merely pre-fill the
  // draft textarea — nothing is asked automatically.
  const [draft, setDraft] = useState(initialQuestion);
  const [question, setQuestion] = useState("");
  const hasAsked = question.trim().length > 0;
  const response = hasAsked ? answerQuestion(question, collections) : null;

  const ask = (value: string) => {
    if (!value.trim()) return;
    setDraft(value);
    setQuestion(value);
    askRemote(value);
  };

  const evidence = remote?.evidence ?? response?.evidence ?? [];
  const path = remote?.path ?? response?.path ?? [];

  return (
    <div className="w-full">
      <p className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-teal-700 ring-1 ring-teal-100">
        <ChatIcon className="h-3.5 w-3.5" />
        Ask Brainbase
      </p>
      <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
        Ask anything about company knowledge
      </h1>
      <p className="my-4 max-w-2xl text-base leading-7 text-slate-600">
        Answers are built by following the relationships between projects, people, decisions,
        documents, and topics 
      </p>

      {/* Top container: question form + suggestions */}
      <div className="grid gap-5 md:grid-cols-2">
        {/* Question panel */}
        <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <form
            className="flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              ask(draft);
            }}
          >
            <label htmlFor="ask-question" className="text-sm font-semibold">
              Your question
            </label>
            <textarea
              id="ask-question"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={5}
              className="w-full resize-none rounded-xl border border-slate-300 bg-white p-4 text-base leading-7 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
            />
            <button className="h-11 self-start rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 active:scale-[0.99]">
              Ask Brainbase
            </button>
          </form>
        </section>

        {/* Suggestions panel */}
        <section className="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-sm font-semibold text-slate-700">Try a suggested question</h2>
          <div className="mt-3 flex flex-1 flex-col gap-2.5">
            {sampleQuestions.map((sample) => (
              <button
                key={sample}
                type="button"
                title={sample}
                onClick={() => setDraft(sample)}
                className="block w-full flex-1 truncate rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-left text-sm text-slate-700 transition hover:border-teal-400 hover:bg-teal-50"
              >
                {sample}
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Bottom container: answer + relationship graph, starting at the same top edge */}
      <div className="mt-5 grid items-start gap-5 md:grid-cols-2">
        {/* Answer panel */}
        {hasAsked ? (
          <article className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-linear-to-r from-teal-50/70 via-white to-white p-5 sm:p-7">
              <p className="inline-flex items-center gap-1.5 rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-teal-300">
                <SparkleIcon className="h-3.5 w-3.5" />
                Answer
              </p>
              <h2 className="mt-3 max-w-3xl text-xl font-bold leading-snug sm:text-2xl">
                {remote?.title ?? response?.title}
              </h2>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-700">
                {remote?.answer ?? response?.answer}
              </p>
              {isLoading ? (
                <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-teal-700 ring-1 ring-teal-100">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-600" />
                  Checking the database-backed knowledge graph…
                </p>
              ) : null}
              {error ? (
                <p className="mt-4 rounded-lg border-l-[3px] border-slate-400 bg-slate-50 px-4 py-2.5 text-sm leading-6 text-slate-600">
                  {error}
                </p>
              ) : null}
            </div>

            {/* Knowledge / evidence */}
            <section className="p-5 sm:p-7">
              <h3 className="flex items-center gap-2 font-semibold">
                <DocumentIcon className="h-4 w-4 text-amber-500" />
                Knowledge
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                The specific records the answer draws from.
              </p>
              <div className="mt-4 grid gap-2.5">
                {evidence.map((item, index) =>
                  typeof item === "string" ? (
                    <p
                      key={index}
                      className="rounded-xl border border-amber-200/70 bg-amber-50/60 px-4 py-3 text-sm leading-6 text-amber-950"
                    >
                      {item}
                    </p>
                  ) : (
                    <div
                      key={item.id}
                      className="rounded-xl border border-amber-200/70 bg-amber-50/60 px-4 py-3"
                    >
                      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-amber-900">
                        <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.1em] text-amber-700 ring-1 ring-amber-200">
                          {item.kind}
                        </span>
                        {item.label}
                      </p>
                      <p className="mt-1.5 text-sm leading-6 text-amber-950/90">{item.excerpt}</p>
                    </div>
                  ),
                )}
                {evidence.length === 0 ? (
                  <p className="text-sm text-slate-500">No evidence recorded for this answer.</p>
                ) : null}
              </div>
            </section>
          </article>
        ) : (
          <article className="flex min-h-64 min-w-0 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center shadow-sm">
            <ChatIcon className="h-8 w-8 text-teal-600" />
            <p className="font-semibold text-slate-800">Ask a question to see the answer</p>
            <p className="max-w-xs text-sm leading-6 text-slate-500">
              Type your own question or pick a suggested one, then press Ask Brainbase to see the
              answer, knowledge, and relationship graph here.
            </p>
          </article>
        )}

        {/* Relationship graph */}
        <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h3 className="flex items-center gap-2 font-semibold">
            <LinkIcon className="h-4 w-4 text-teal-700" />
            Relationship graph
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Why the answer holds together — the entities are connected in the graph, not just
            matched on words.
          </p>
          {hasAsked && path.length > 0 ? (
            <ol className="mt-5">
              {path.map((step, index) => {
                const next = path[index + 1];
                const via = next?.via ?? "connected to";
                return (
                  <li key={index} className="relative flex gap-4 pb-6 last:pb-0">
                    {next ? (
                      <span
                        aria-hidden
                        className="absolute bottom-0 left-4 top-9 w-0 border-l-2 border-dashed border-teal-300"
                      />
                    ) : null}
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-teal-500 to-teal-700 text-sm font-bold text-white shadow-sm">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="pt-1 font-semibold text-slate-800">{step.title}</p>
                      {next ? (
                        <p className="mt-2 inline-flex rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-teal-700 ring-1 ring-teal-100">
                          {via}
                        </p>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ol>
          ) : hasAsked ? (
            <p className="mt-4 text-sm text-slate-500">No relationship path for this answer.</p>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              Press Ask Brainbase and the relationship graph behind the answer appears here.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
