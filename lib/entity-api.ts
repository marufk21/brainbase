import "server-only";
import { database } from "@/lib/database";

export const entities = ["people", "clients", "projects", "topics", "decisions", "documents"] as const;
export type Entity = (typeof entities)[number];

const fields: Record<Entity, string[]> = {
  people: ["name", "role", "email", "skills"],
  clients: ["name", "industry", "company_size", "primary_contact", "status", "notes"],
  projects: ["name", "status", "start_date", "end_date", "description"],
  topics: ["name", "description"],
  decisions: ["title", "summary", "decided_at"],
  documents: ["title", "summary", "content_markdown", "source_url", "source_type"],
};

export function isEntity(value: string): value is Entity {
  return entities.includes(value as Entity);
}

export async function list(entity: Entity) {
  return (await database().query(`SELECT * FROM ${entity} ORDER BY created_at DESC`)).rows;
}

export async function get(entity: Entity, id: string) {
  return (await database().query(`SELECT * FROM ${entity} WHERE id = $1`, [id])).rows[0] ?? null;
}

export async function create(entity: Entity, body: unknown) {
  const data = sanitize(entity, body);
  const columns = Object.keys(data);
  if (!columns.length) throw new ApiError(400, "No valid fields supplied");
  const values = columns.map((column) => data[column]);
  const placeholders = columns.map((_, index) => `$${index + 1}`);
  const result = await database().query(`INSERT INTO ${entity} (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`, values);
  return result.rows[0];
}

export async function update(entity: Entity, id: string, body: unknown) {
  const data = sanitize(entity, body);
  const columns = Object.keys(data);
  if (!columns.length) throw new ApiError(400, "No valid fields supplied");
  const assignments = columns.map((column, index) => `${column} = $${index + 1}`);
  assignments.push("updated_at = now()");
  const result = await database().query(`UPDATE ${entity} SET ${assignments.join(", ")} WHERE id = $${columns.length + 1} RETURNING *`, [...columns.map((column) => data[column]), id]);
  return result.rows[0] ?? null;
}

export async function remove(entity: Entity, id: string) {
  const result = await database().query(`DELETE FROM ${entity} WHERE id = $1 RETURNING id`, [id]);
  return (result.rowCount ?? 0) > 0;
}

function sanitize(entity: Entity, body: unknown) {
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new ApiError(400, "Expected a JSON object");
  const source = body as Record<string, unknown>;
  const data: Record<string, unknown> = {};
  for (const field of fields[entity]) {
    if (source[field] !== undefined) data[field] = source[field];
  }
  if (entity === "projects" && data.status) data.status = String(data.status).toLowerCase().replaceAll(" ", "_");
  if (entity === "clients" && data.status) data.status = String(data.status).toLowerCase();
  return data;
}

export class ApiError extends Error {
  constructor(readonly status: number, message: string) { super(message); }
}
