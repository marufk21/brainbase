import { AppShell } from "@/components/AppShell";
import { answerQuestion, sampleQuestions } from "@/lib/knowledge";

export default async function AskPage(props: PageProps<"/ask">) {
  const searchParams = await props.searchParams;
  const question =
    typeof searchParams.q === "string" ? searchParams.q : sampleQuestions[0];
  const response = answerQuestion(question);

  return (
    <AppShell>
      <div className="max-w-5xl">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">
          Ask Brainbase
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal md:text-4xl">
          Ask anything about company knowledge
        </h1>
        <p className="mt-2 max-w-2xl text-base leading-7 text-slate-600">
          The answer uses linked projects, people, decisions, documents, and topics.
        </p>

        <section className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="border border-slate-200 bg-white p-5">
            <form className="flex flex-col gap-3" action="/ask">
              <textarea
                name="q"
                defaultValue={question}
                rows={6}
                className="w-full resize-none border border-slate-300 bg-white p-4 text-base leading-7 outline-none focus:border-teal-700"
              />
              <button className="h-11 border border-slate-950 bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-teal-800">
                Ask
              </button>
            </form>

            <div className="mt-6">
              <h2 className="font-semibold">Suggested questions</h2>
              <div className="mt-3 grid gap-2">
                {sampleQuestions.map((sample) => (
                  <a
                    key={sample}
                    href={`/ask?q=${encodeURIComponent(sample)}`}
                    className="border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700 transition hover:border-teal-500 hover:bg-teal-50"
                  >
                    {sample}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <article className="border border-slate-200 bg-white p-5">
            <h2 className="text-2xl font-semibold">Answer</h2>
            <p className="mt-4 text-base leading-7 text-slate-700">{response.answer}</p>

            <div className="mt-6 border-t border-slate-200 pt-5">
              <h3 className="font-semibold">Evidence</h3>
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
              <div className="mt-3 grid gap-0">
                {response.path.map((step, index) => (
                  <div key={step}>
                    <div className="flex items-center gap-3 border border-slate-200 bg-slate-50 p-3 text-sm">
                      <span className="flex h-7 w-7 items-center justify-center border border-teal-200 bg-teal-50 font-semibold text-teal-900">
                        {index + 1}
                      </span>
                      <span className="font-medium text-slate-800">{step}</span>
                    </div>
                    {index < response.path.length - 1 ? (
                      <div className="ml-6 flex h-8 items-center border-l-2 border-teal-300 pl-5 text-xs font-semibold uppercase tracking-[0.12em] text-teal-700">
                        connected to
                      </div>
                    ) : null}
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
