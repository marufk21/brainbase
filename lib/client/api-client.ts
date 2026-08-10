/**
 * Client-side API service layer.
 * All HTTP communication with the server lives here so components and hooks
 * never contain raw fetch(), response parsing, or DTO mapping.
 * This module must stay free of `server-only` imports.
 */
import type { AskResult, KnowledgeCollections } from "@/lib/types";

/** DB row shapes returned by GET /api/knowledge. */
type ClientRow = {
  id: string;
  name: string;
  industry: string;
  company_size: string;
  primary_contact: string;
  status: string;
  notes: string;
};
type PersonRow = { id: string; name: string; role: string; email: string; skills: string[] };
type ProjectRow = {
  id: string;
  name: string;
  status: string;
  start_date: string;
  end_date?: string;
  description: string;
};
type TopicRow = { id: string; name: string; description: string };
type DecisionRow = { id: string; title: string; summary: string; decided_at: string };
type DocumentRow = { id: string; title: string; summary: string };
type MessageRow = { id: string; occurred_at: string; body: string; channel: string };

type KnowledgeDto = {
  clients: ClientRow[];
  people: PersonRow[];
  projects: ProjectRow[];
  topics: TopicRow[];
  decisions: DecisionRow[];
  documents: DocumentRow[];
  messages: MessageRow[];
  edges: {
    pc: Array<{ project_id: string; client_id: string }>;
    pt: Array<{ project_id: string; person_id: string; is_lead: boolean }>;
    pj: Array<{ project_id: string; topic_id: string }>;
    dp: Array<{ decision_id: string; project_id: string }>;
    dpe: Array<{ decision_id: string; person_id: string; relationship: string }>;
    dt: Array<{ decision_id: string; topic_id: string }>;
    docp: Array<{ document_id: string; project_id: string }>;
    doct: Array<{ document_id: string; topic_id: string }>;
    mp: Array<{ message_id: string; person_id: string; relationship_label: string }>;
  };
};

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Request to ${path} failed (${response.status})`);
  return (await response.json()) as T;
}

/** POST /api/ask — DB-backed, relationship-aware answer. */
export async function askRemoteQuestion(question: string): Promise<AskResult> {
  const response = await fetch("/api/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
  if (!response.ok) throw new Error(`Ask request failed (${response.status})`);
  return (await response.json()) as AskResult;
}

/** GET /api/knowledge — DB snapshot mapped into the client domain model. */
export async function fetchKnowledgeSnapshot(): Promise<KnowledgeCollections> {
  return mapKnowledgeDto(await getJson<KnowledgeDto>("/api/knowledge"));
}

export function mapKnowledgeDto(data: KnowledgeDto): KnowledgeCollections {
  const topicId = new Map(data.topics.map((topic) => [topic.id, topic.name]));
  const personName = new Map(data.people.map((person) => [person.id, person.name]));

  const projectClient = new Map(data.edges.pc.map((edge) => [edge.project_id, edge.client_id]));
  const team = new Map<string, string[]>();
  data.edges.pt.forEach((edge) =>
    team.set(edge.project_id, [...(team.get(edge.project_id) ?? []), edge.person_id]),
  );
  const lead = new Map(
    data.edges.pt
      .filter((edge) => edge.is_lead)
      .map((edge) => [edge.project_id, edge.person_id] as const),
  );
  const projectTopics = new Map<string, string[]>();
  data.edges.pj.forEach((edge) =>
    projectTopics.set(
      edge.project_id,
      [...(projectTopics.get(edge.project_id) ?? []), topicId.get(edge.topic_id)].filter(
        (name): name is string => Boolean(name),
      ),
    ),
  );
  const decisionProject = new Map(
    data.edges.dp.map((edge) => [edge.decision_id, edge.project_id] as const),
  );
  const decisionPeople = new Map<string, string[]>();
  data.edges.dpe.forEach((edge) =>
    decisionPeople.set(edge.decision_id, [
      ...(decisionPeople.get(edge.decision_id) ?? []),
      edge.person_id,
    ]),
  );
  const decisionOwner = new Map(
    data.edges.dpe
      .filter((edge) => edge.relationship === "owner")
      .map((edge) => [edge.decision_id, edge.person_id] as const),
  );
  const decisionTopics = new Map<string, string[]>();
  data.edges.dt.forEach((edge) =>
    decisionTopics.set(
      edge.decision_id,
      [...(decisionTopics.get(edge.decision_id) ?? []), topicId.get(edge.topic_id)].filter(
        (name): name is string => Boolean(name),
      ),
    ),
  );
  const messageAuthor = new Map(
    data.edges.mp.map((edge) => [edge.message_id, personName.get(edge.person_id)] as const),
  );

  return {
    clients: data.clients.map((row) => ({
      id: row.id,
      name: row.name,
      industry: row.industry,
      size: row.company_size,
      primary_contact: row.primary_contact,
      status: row.status,
      notes: row.notes,
    })),
    people: data.people.map((row) => ({
      id: row.id,
      name: row.name,
      role: row.role,
      email: row.email,
      skills: row.skills ?? [],
    })),
    topics: data.topics.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
    })),
    projects: data.projects.map((row) => ({
      id: row.id,
      name: row.name,
      status: row.status,
      start_date: row.start_date,
      ...(row.end_date ? { end_date: row.end_date } : {}),
      description: row.description,
      client_id: projectClient.get(row.id) ?? null,
      lead: lead.get(row.id) ?? team.get(row.id)?.[0] ?? "",
      team: team.get(row.id) ?? [],
      key_topics: projectTopics.get(row.id) ?? [],
    })),
    decisions: data.decisions.map((row) => ({
      id: row.id,
      title: row.title,
      summary: row.summary,
      date: row.decided_at,
      project_id: decisionProject.get(row.id) ?? null,
      made_by: decisionOwner.get(row.id) ?? "",
      participants: decisionPeople.get(row.id) ?? [],
      related_topics: decisionTopics.get(row.id) ?? [],
    })),
    documents: data.documents.map((row) => ({
      id: row.id,
      label: row.title,
      summary: row.summary,
      projects: data.edges.docp
        .filter((edge) => edge.document_id === row.id)
        .map((edge) => edge.project_id),
      topics: data.edges.doct
        .filter((edge) => edge.document_id === row.id)
        .map((edge) => topicId.get(edge.topic_id))
        .filter((name): name is string => Boolean(name)),
    })),
    slackMessages: data.messages.map((row) => ({
      ts: row.occurred_at,
      user: messageAuthor.get(row.id) ?? "Team",
      text: row.body,
    })),
  };
}
