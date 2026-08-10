"use client";

import { useState } from "react";
import { answerQuestion, sampleQuestions } from "@/lib/knowledge";
import { useKnowledge } from "@/components/knowledge-store";
import { ChatIcon, LinkIcon, SparkleIcon } from "@/components/icons";

export function AskView({ initialQuestion }: { initialQuestion: string }) {
  const { collections } = useKnowledge();
  const [draft, setDraft] = useState(initialQuestion);
  const [question, setQuestion] = useState(initialQuestion);
  const response = answerQuestion(question, collections);

  const ask = (value: string) => {
    setDraft(value);
    setQuestion(value);
  };

  return (
    <div className="w-full">
      <p className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-teal-700 ring-1 ring-teal-100">
        <ChatIcon className="h-3.5 w-3.5" />
        Ask Brainbase
      </p>
      <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
        Ask anything about company knowledge
      </h1>
      <p className="mt-2 max-w-2xl text-base leading-7 text-slate-600">
        Answers are built by following the relationships between projects,
        people, decisions, documents, and topics — not by keyword search.
      </p>

      <section className="mt-6 grid items-start gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        {/* Question panel */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <form
            className="flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              setQuestion(draft);
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
            <button className="h-11 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 active:scale-[0.99]">
              Ask Brainbase
            </button>
          </form>

          <div className="mt-6">
            <h2 className="text-sm font-semibold text-slate-700">
              Try a suggested question
            </h2>
            <div className="mt-3 grid gap-2">
              {sampleQuestions.map((sample) => (
                <button
                  key={sample}
                  onClick={() => ask(sample)}
                  className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-left text-sm leading-6 text-slate-700 transition hover:border-teal-400 hover:bg-teal-50"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Answer panel */}
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-teal-300">
            <SparkleIcon className="h-3.5 w-3.5" />
            Answer
          </p>
          <h2 className="mt-3 text-xl font-bold leading-snug sm:text-2xl">
            {response.title}
          </h2>
          <p className="mt-3 text-base leading-7 text-slate-700">
            {response.answer}
          </p>

          <div className="mt-6 border-t border-slate-100 pt-5">
            <h3 className="font-semibold">Evidence</h3>
            <p className="mt-1 text-sm text-slate-500">
              The specific records the answer draws from.
            </p>
            <div className="mt-3 grid gap-2">
              {response.evidence.map((item) => (
                <p
                  key={item}
                  className="rounded-lg border-l-[3px] border-amber-400 bg-amber-50 px-4 py-2.5 text-sm leading-6 text-amber-950"
                >
                  {item}
                </p>
              ))}
            </div>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-5">
            <h3 className="flex items-center gap-2 font-semibold">
              <LinkIcon className="h-4 w-4 text-teal-700" />
              Relationship path
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Why the answer holds together — the entities are connected in the
              graph, not just matched on words.
            </p>
            <div className="mt-4 grid gap-0">
              {response.path.map((step, index) => {
                const next = response.path[index + 1];
                const via = next?.via ?? "connected to";
                return (
                  <div key={index}>
                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white">
                        {index + 1}
                      </span>
                      <span className="font-medium text-slate-800">
                        {step.title}
                      </span>
                    </div>
                    {next ? (
                      <div className="ml-[2.15rem] flex h-9 items-center gap-2 border-l-2 border-dashed border-teal-300 pl-5 text-xs font-semibold uppercase tracking-[0.12em] text-teal-700">
                        {via}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
