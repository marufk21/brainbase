#!/usr/bin/env node
/**
 * Builds an idempotent PostgreSQL seed from every JSON and Markdown source in
 * data/. Run `node db/seed.mjs --dry-run` to inspect SQL, or pipe it to psql.
 */
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { resolve, basename } from "node:path";

const root = resolve(import.meta.dirname, "..");
const dataDir = resolve(root, "data");
const sql = [];
const ids = new Map();

const quote = (value) => `'${String(value ?? "").replaceAll("'", "''")}'`;
const uuid = (type, legacyId) => {
  const key = `${type}:${legacyId}`;
  if (ids.has(key)) return ids.get(key);
  const bytes = createHash("sha256").update(`brainbase-seed/${key}`).digest().subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString("hex");
  const value = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  ids.set(key, value);
  return value;
};
const array = (values) => `ARRAY[${values.map(quote).join(", ")}]::text[]`;
const readJson = async (name) => JSON.parse(await readFile(resolve(dataDir, name), "utf8"));
const projectStatus = (value) =>
  ({ "In Progress": "in_progress", Discovery: "discovery", Completed: "completed" })[value] ??
  "discovery";
const clientStatus = (value) => ({ Active: "active", Past: "past" })[value] ?? "lead";
const insert = (statement) => sql.push(statement);

const [people, clients, projects, decisions, topics, messages] = await Promise.all([
  readJson("people.json"),
  readJson("clients.json"),
  readJson("projects.json"),
  readJson("decisions.json"),
  readJson("topics.json"),
  readJson("slack-exports/general-channel-excerpt.json"),
]);

const topicByName = new Map(topics.map((topic) => [topic.name, topic]));
for (const name of [
  ...projects.flatMap((item) => item.key_topics),
  ...decisions.flatMap((item) => item.related_topics),
]) {
  if (!topicByName.has(name)) {
    const topic = {
      id: `generated-${name.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-")}`,
      name,
      description: "Added during seed because it is referenced by sample data.",
    };
    topics.push(topic);
    topicByName.set(name, topic);
  }
}

insert("BEGIN;");
for (const person of people)
  insert(
    `INSERT INTO people (id, name, role, email, skills) VALUES (${quote(uuid("person", person.id))}::uuid, ${quote(person.name)}, ${quote(person.role)}, ${quote(person.email)}, ${array(person.skills)}) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role, email = EXCLUDED.email, skills = EXCLUDED.skills, updated_at = now();`,
  );
for (const client of clients)
  insert(
    `INSERT INTO clients (id, name, industry, company_size, primary_contact, status, notes) VALUES (${quote(uuid("client", client.id))}::uuid, ${quote(client.name)}, ${quote(client.industry)}, ${quote(client.size)}, ${quote(client.primary_contact)}, ${quote(clientStatus(client.status))}::client_status, ${quote(client.notes)}) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, industry = EXCLUDED.industry, company_size = EXCLUDED.company_size, primary_contact = EXCLUDED.primary_contact, status = EXCLUDED.status, notes = EXCLUDED.notes, updated_at = now();`,
  );
for (const topic of topics)
  insert(
    `INSERT INTO topics (id, name, description) VALUES (${quote(uuid("topic", topic.id))}::uuid, ${quote(topic.name)}, ${quote(topic.description)}) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, updated_at = now();`,
  );
for (const project of projects) {
  const projectId = uuid("project", project.id);
  insert(
    `INSERT INTO projects (id, name, status, start_date, end_date, description) VALUES (${quote(projectId)}::uuid, ${quote(project.name)}, ${quote(projectStatus(project.status))}::project_status, ${quote(project.start_date)}::date, ${project.end_date ? `${quote(project.end_date)}::date` : "NULL"}, ${quote(project.description)}) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, status = EXCLUDED.status, start_date = EXCLUDED.start_date, end_date = EXCLUDED.end_date, description = EXCLUDED.description, updated_at = now();`,
  );
  if (project.client_id)
    insert(
      `INSERT INTO project_clients (project_id, client_id) VALUES (${quote(projectId)}::uuid, ${quote(uuid("client", project.client_id))}::uuid) ON CONFLICT (project_id) DO UPDATE SET client_id = EXCLUDED.client_id;`,
    );
  for (const personId of project.team)
    insert(
      `INSERT INTO project_team (project_id, person_id, is_lead) VALUES (${quote(projectId)}::uuid, ${quote(uuid("person", personId))}::uuid, ${personId === project.lead}) ON CONFLICT (project_id, person_id) DO UPDATE SET is_lead = EXCLUDED.is_lead;`,
    );
  for (const topicName of project.key_topics)
    insert(
      `INSERT INTO project_topics (project_id, topic_id) VALUES (${quote(projectId)}::uuid, ${quote(uuid("topic", topicByName.get(topicName).id))}::uuid) ON CONFLICT DO NOTHING;`,
    );
}
for (const decision of decisions) {
  const decisionId = uuid("decision", decision.id);
  insert(
    `INSERT INTO decisions (id, title, summary, decided_at) VALUES (${quote(decisionId)}::uuid, ${quote(decision.title)}, ${quote(decision.summary)}, ${quote(decision.date)}::date) ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, summary = EXCLUDED.summary, decided_at = EXCLUDED.decided_at, updated_at = now();`,
  );
  if (decision.project_id)
    insert(
      `INSERT INTO decision_projects (decision_id, project_id) VALUES (${quote(decisionId)}::uuid, ${quote(uuid("project", decision.project_id))}::uuid) ON CONFLICT (decision_id) DO UPDATE SET project_id = EXCLUDED.project_id;`,
    );
  for (const personId of new Set([decision.made_by, ...decision.participants]))
    insert(
      `INSERT INTO decision_people (decision_id, person_id, relationship) VALUES (${quote(decisionId)}::uuid, ${quote(uuid("person", personId))}::uuid, ${quote(personId === decision.made_by ? "owner" : "participant")}::decision_person_role) ON CONFLICT (decision_id, person_id) DO UPDATE SET relationship = EXCLUDED.relationship;`,
    );
  for (const topicName of decision.related_topics)
    insert(
      `INSERT INTO decision_topics (decision_id, topic_id) VALUES (${quote(decisionId)}::uuid, ${quote(uuid("topic", topicByName.get(topicName).id))}::uuid) ON CONFLICT DO NOTHING;`,
    );
}

const markdownFiles = (await readdir(resolve(dataDir, "documents"))).filter((name) =>
  name.endsWith(".md"),
);
for (const file of markdownFiles) {
  const content = await readFile(resolve(dataDir, "documents", file), "utf8");
  const title = content.match(/^#\s+(.+)$/m)?.[1] ?? basename(file, ".md");
  const summary = content.replace(/^#.*$/m, "").trim().replaceAll(/\s+/g, " ").slice(0, 500);
  const documentId = uuid("document", file);
  insert(
    `INSERT INTO documents (id, title, summary, content_markdown, source_type) VALUES (${quote(documentId)}::uuid, ${quote(title)}, ${quote(summary)}, ${quote(content)}, 'markdown') ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, summary = EXCLUDED.summary, content_markdown = EXCLUDED.content_markdown, updated_at = now();`,
  );
  const haystack = `${title}\n${content}`.toLowerCase();
  for (const project of projects.filter((item) =>
    haystack.includes(item.name.split(" ")[0].toLowerCase()),
  ))
    insert(
      `INSERT INTO document_projects (document_id, project_id) VALUES (${quote(documentId)}::uuid, ${quote(uuid("project", project.id))}::uuid) ON CONFLICT DO NOTHING;`,
    );
  for (const topic of topics.filter((item) => haystack.includes(item.name.toLowerCase())))
    insert(
      `INSERT INTO document_topics (document_id, topic_id) VALUES (${quote(documentId)}::uuid, ${quote(uuid("topic", topic.id))}::uuid) ON CONFLICT DO NOTHING;`,
    );
  for (const decision of decisions.filter((item) => haystack.includes(item.title.toLowerCase())))
    insert(
      `INSERT INTO document_decisions (document_id, decision_id) VALUES (${quote(documentId)}::uuid, ${quote(uuid("decision", decision.id))}::uuid) ON CONFLICT DO NOTHING;`,
    );
}

for (const message of messages) {
  const messageId = uuid("message", `${message.ts}:${message.user}`);
  insert(
    `INSERT INTO messages (id, occurred_at, body, channel) VALUES (${quote(messageId)}::uuid, ${quote(message.ts)}::timestamptz, ${quote(message.text)}, 'general') ON CONFLICT (id) DO UPDATE SET occurred_at = EXCLUDED.occurred_at, body = EXCLUDED.body, channel = EXCLUDED.channel;`,
  );
  const author = people.find((person) => person.name === message.user);
  if (author)
    insert(
      `INSERT INTO message_people (message_id, person_id) VALUES (${quote(messageId)}::uuid, ${quote(uuid("person", author.id))}::uuid) ON CONFLICT DO NOTHING;`,
    );
  const haystack = message.text.toLowerCase();
  for (const project of projects.filter((item) =>
    haystack.includes(item.name.split(" ")[0].toLowerCase()),
  ))
    insert(
      `INSERT INTO message_projects (message_id, project_id) VALUES (${quote(messageId)}::uuid, ${quote(uuid("project", project.id))}::uuid) ON CONFLICT DO NOTHING;`,
    );
  for (const topic of topics.filter((item) =>
    haystack.includes(item.name.toLowerCase().split(" ")[0]),
  ))
    insert(
      `INSERT INTO message_topics (message_id, topic_id) VALUES (${quote(messageId)}::uuid, ${quote(uuid("topic", topic.id))}::uuid) ON CONFLICT DO NOTHING;`,
    );
}
insert("COMMIT;");

process.stdout.write(`${sql.join("\n")}\n`);
