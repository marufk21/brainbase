import { AppShell } from "@/components/AppShell";
import { knowledge } from "@/lib/knowledge";

export default function ManagePage() {
  return (
    <AppShell>
      <div className="max-w-5xl">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">
          Add / Edit
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal md:text-4xl">
          Manage a decision
        </h1>
        <p className="mt-2 max-w-2xl text-base leading-7 text-slate-600">
          UI-only form for adding or editing a decision and linking it to project,
          people, documents, and topics.
        </p>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <form className="border border-slate-200 bg-white p-5">
            <div className="grid gap-4">
              <label className="grid gap-2 text-sm font-semibold">
                Decision title
                <input
                  defaultValue="Do not build full Slack integration in v1"
                  className="h-11 border border-slate-300 px-3 font-normal outline-none focus:border-teal-700"
                />
              </label>

              <label className="grid gap-2 text-sm font-semibold">
                Summary
                <textarea
                  rows={5}
                  defaultValue="Slack has too much noise. First version should focus on documents, decisions, people, and projects."
                  className="resize-none border border-slate-300 p-3 font-normal leading-7 outline-none focus:border-teal-700"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold">
                  Project
                  <select className="h-11 border border-slate-300 px-3 font-normal outline-none focus:border-teal-700">
                    {knowledge.projects.map((project) => (
                      <option key={project.id}>{project.name}</option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-2 text-sm font-semibold">
                  Made by
                  <select className="h-11 border border-slate-300 px-3 font-normal outline-none focus:border-teal-700">
                    {knowledge.people.map((person) => (
                      <option key={person.id}>{person.name}</option>
                    ))}
                  </select>
                </label>
              </div>

              <fieldset className="border border-slate-200 p-4">
                <legend className="px-2 text-sm font-semibold">Participants</legend>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  {knowledge.people.slice(0, 6).map((person) => (
                    <label key={person.id} className="flex items-center gap-2 text-sm text-slate-700">
                      <input type="checkbox" defaultChecked={["p001", "p005", "p006"].includes(person.id)} />
                      {person.name}
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className="border border-slate-200 p-4">
                <legend className="px-2 text-sm font-semibold">Related topics</legend>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  {knowledge.topics.slice(0, 8).map((topic) => (
                    <label key={topic.id} className="flex items-center gap-2 text-sm text-slate-700">
                      <input type="checkbox" defaultChecked={["Internal Knowledge", "Scope Control"].includes(topic.name)} />
                      {topic.name}
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className="border border-slate-200 p-4">
                <legend className="px-2 text-sm font-semibold">Linked documents</legend>
                <div className="mt-2 grid gap-2">
                  {knowledge.documents.map((document) => (
                    <label key={document.id} className="flex items-center gap-2 text-sm text-slate-700">
                      <input type="checkbox" defaultChecked={document.id === "doc-decision-log"} />
                      {document.label}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="flex flex-wrap gap-3">
                <button className="h-11 border border-slate-950 bg-slate-950 px-4 text-sm font-semibold text-white">
                  Save decision
                </button>
                <button className="h-11 border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700">
                  Preview relationships
                </button>
              </div>
            </div>
          </form>

          <aside className="border border-slate-200 bg-white p-5">
            <h2 className="text-xl font-semibold">Relationship preview</h2>
            <div className="mt-4 grid gap-3 text-sm">
              {[
                "Decision → belongs to → Internal Knowledge Base (v1)",
                "Ananya Sharma → made → Slack integration decision",
                "Sneha Patel → participated in → Slack integration decision",
                "Decision → about → Scope Control",
                "Decision Log → mentions → Slack integration decision",
              ].map((item) => (
                <p key={item} className="border border-slate-200 bg-slate-50 p-3 leading-6 text-slate-700">
                  {item}
                </p>
              ))}
            </div>
          </aside>
        </section>
      </div>
    </AppShell>
  );
}
