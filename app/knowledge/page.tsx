import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { getProjectDetails, knowledge } from "@/lib/knowledge";

const tabs = [
  "projects",
  "people",
  "clients",
  "decisions",
  "documents",
  "topics",
] as const;

type KnowledgeType = (typeof tabs)[number];

export default async function KnowledgePage(props: PageProps<"/knowledge">) {
  const searchParams = await props.searchParams;
  const selectedType = tabs.includes(searchParams.type as KnowledgeType)
    ? (searchParams.type as KnowledgeType)
    : "projects";
  const selectedProject =
    typeof searchParams.project === "string"
      ? searchParams.project
      : knowledge.projects[0].id;
  const projectDetails = getProjectDetails(selectedProject);

  return (
    <AppShell>
      <div className="max-w-6xl">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">
              Knowledge
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal md:text-4xl">
              Browse company data
            </h1>
            <p className="mt-2 max-w-2xl text-base leading-7 text-slate-600">
              Explore projects, people, clients, documents, decisions, and topics.
            </p>
          </div>
          <button className="h-11 border border-slate-950 bg-slate-950 px-4 text-sm font-semibold text-white">
            + Add
          </button>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <Link
              key={tab}
              href={`/knowledge?type=${tab}`}
              className={`border px-3 py-2 text-sm font-semibold capitalize ${
                selectedType === tab
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:border-teal-500"
              }`}
            >
              {tab}
            </Link>
          ))}
        </div>

        {selectedType === "projects" ? (
          <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <section className="grid gap-3">
              {knowledge.projects.map((project) => {
                const details = getProjectDetails(project.id);
                return (
                  <Link
                    key={project.id}
                    href={`/knowledge?type=projects&project=${project.id}`}
                    className={`border p-4 transition ${
                      projectDetails.project.id === project.id
                        ? "border-teal-500 bg-teal-50"
                        : "border-slate-200 bg-white hover:border-teal-300"
                    }`}
                  >
                    <div className="flex flex-col justify-between gap-2 sm:flex-row">
                      <h2 className="font-semibold">{project.name}</h2>
                      <span className="text-sm text-slate-600">{project.status}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      Client: {details.client?.name ?? "Internal"}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      People: {details.people.length} | Decisions:{" "}
                      {details.decisions.length} | Docs: {details.documents.length}
                    </p>
                  </Link>
                );
              })}
            </section>

            <ProjectDetail details={projectDetails} />
          </div>
        ) : (
          <EntityList selectedType={selectedType} />
        )}
      </div>
    </AppShell>
  );
}

function ProjectDetail({
  details,
}: {
  details: ReturnType<typeof getProjectDetails>;
}) {
  return (
    <article className="border border-slate-200 bg-white p-5">
      <h2 className="text-2xl font-semibold">{details.project.name}</h2>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        {details.project.description}
      </p>

      <DetailSection title="Client" items={[details.client?.name ?? "Internal"]} />
      <DetailSection title="People" items={details.people.map((person) => person.name)} />
      <DetailSection
        title="Decisions"
        items={details.decisions.map((decision) => decision.title)}
      />
      <DetailSection
        title="Documents"
        items={details.documents.map((document) => document.label)}
      />
      <DetailSection title="Topics" items={details.topics.map((topic) => topic.name)} />
    </article>
  );
}

function DetailSection({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="mt-5 border-t border-slate-200 pt-4">
      <h3 className="font-semibold">{title}</h3>
      <div className="mt-2 grid gap-2">
        {items.length > 0 ? (
          items.map((item) => (
            <p key={item} className="text-sm leading-6 text-slate-700">
              → {item}
            </p>
          ))
        ) : (
          <p className="text-sm text-slate-500">No linked records yet.</p>
        )}
      </div>
    </section>
  );
}

function EntityList({ selectedType }: { selectedType: Exclude<KnowledgeType, "projects"> }) {
  const items = {
    people: knowledge.people.map((person) => ({
      title: person.name,
      meta: person.role,
      body: person.skills.join(", "),
    })),
    clients: knowledge.clients.map((client) => ({
      title: client.name,
      meta: `${client.industry} | ${client.status}`,
      body: client.notes,
    })),
    decisions: knowledge.decisions.map((decision) => ({
      title: decision.title,
      meta: decision.date,
      body: decision.summary,
    })),
    documents: knowledge.documents.map((document) => ({
      title: document.label,
      meta: "Document",
      body: document.summary,
    })),
    topics: knowledge.topics.map((topic) => ({
      title: topic.name,
      meta: "Topic",
      body: topic.description,
    })),
  }[selectedType];

  return (
    <section className="mt-6 grid gap-3 md:grid-cols-2">
      {items.map((item) => (
        <article key={item.title} className="border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-teal-700">
            {item.meta}
          </p>
          <h2 className="mt-2 font-semibold">{item.title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
        </article>
      ))}
    </section>
  );
}
