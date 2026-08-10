"use client";

import { useState } from "react";
import { answerQuestion, sampleQuestions } from "@/lib/knowledge";
import { useKnowledge } from "@/components/knowledge-store";

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
    <div className="max-w-5xl">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">
        Ask Brainbase
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-normal md:text-4xl">
        Ask anything about company knowledge
      </h1>
      <p className="mt-2 max-w-2xl text-base leading-7 text-slate-600">
        Answers are built by following the relationships between projects, people,
        decisions, documents, and topics — not by keyword search.
      </p>

      <section className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="border border-slate-200 bg-white p-5">
          <form
            className="flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              setQuestion(draft);
            }}
          >
            <label className="text-sm font-semibold">Your question</label>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={5}
              className="w-full resize-none border border-slate-300 bg-white p-4 text-base leading-7 outline-none focus:border-teal-700"
            />
            <button className="h-11 border border-slate-950 bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-teal-800">
              Ask Brainbase
            </button>
          </form>

          <div className="mt-6">
            <h2 className="font-semibold">Try a suggested question</h2>
            <div className="mt-3 grid gap-2">
              {sampleQuestions.map((sample) => (
                <button
                  key={sample}
                  onClick={() => ask(sample)}
                  className="border border-slate-200 bg-slate-50 p-3 text-left text-sm leading-6 text-slate-700 transition hover:border-teal-500 hover:bg-teal-50"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>
        </div>

        <article className="border border-slate-200 bg-white p-5">
          <h2 className="text-2xl font-semibold">{response.title}</h2>
          <p className="mt-4 text-base leading-7 text-slate-700">{response.answer}</p>

          <div className="mt-6 border-t border-slate-200 pt-5">
            <h3 className="font-semibold">Evidence</h3>
            <p className="mt-1 text-sm text-slate-500">
              The specific records the answer draws from.
            </p>
            <div className="mt-3 grid gap-2">
              {response.evidence.map((item) => (
                <p
                  key={item}
                  className="border-l-2 border-amber-500 bg-amber-50 px-3 py-2 text-sm leading-6 text-amber-950"
                >
                  {item}
                </p>
              ))}
            </div>
          </div>

          <div className="mt-6 border-t border-slate-200 pt-5">
            <h3 className="font-semibold">Relationship path</h3>
            <p className="mt-1 text-sm text-slate-500">
              Why the answer holds together — the entities are connected in the graph,
              not just matched on words.
            </p>
            <div className="mt-3 grid gap-0">
              {response.path.map((step, index) => {
                const next = response.path[index + 1];
                const via = next?.via ?? "connected to";
                return (
                  <div key={index}>
                    <div className="flex items-center gap-3 border border-slate-200 bg-slate-50 p-3 text-sm">
                      <span className="flex h-7 w-7 items-center justify-center border border-teal-200 bg-teal-50 font-semibold text-teal-900">
                        {index + 1}
                      </span>
                      <span className="font-medium text-slate-800">{step.title}</span>
                    </div>
                    {next ? (
                      <div className="ml-6 flex h-8 items-center gap-2 border-l-2 border-teal-300 pl-5 text-xs font-semibold uppercase tracking-[0.12em] text-teal-700">
                        <span aria-hidden className="text-slate-400">
                          ↓
                        </span>
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
