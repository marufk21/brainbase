/**
 * Shared client-safe types for the knowledge domain.
 * This module must stay free of `server-only` imports so it can be used by
 * client components, hooks, tests, and server services alike.
 */

export type EntityKind =
  "client" | "project" | "person" | "decision" | "topic" | "document" | "message";

export interface Client {
  id: string;
  name: string;
  industry: string;
  size: string;
  primary_contact: string;
  status: string;
  notes: string;
}

export interface Person {
  id: string;
  name: string;
  role: string;
  email: string;
  skills: string[];
}

export interface Project {
  id: string;
  name: string;
  client_id: string | null;
  status: string;
  start_date: string;
  end_date?: string;
  lead: string;
  team: string[];
  description: string;
  key_topics: string[];
}

export interface Decision {
  id: string;
  title: string;
  date: string;
  project_id: string | null;
  made_by: string;
  participants: string[];
  summary: string;
  related_topics: string[];
}

export interface Topic {
  id: string;
  name: string;
  description: string;
}

export interface Document {
  id: string;
  label: string;
  summary: string;
  topics: string[];
  projects: string[];
}

export interface SlackMessage {
  ts: string;
  user: string;
  text: string;
}

export interface KnowledgeCollections {
  clients: Client[];
  people: Person[];
  projects: Project[];
  decisions: Decision[];
  topics: Topic[];
  documents: Document[];
  slackMessages: SlackMessage[];
}

/** A node in the knowledge graph, as rendered by views and answer paths. */
export type GraphNode = {
  id: string;
  kind: EntityKind;
  label: string;
  summary: string;
};

export type KnowledgeNode = GraphNode & {
  meta?: string;
};

export type KnowledgeEdge = {
  from: string;
  to: string;
  label: string;
};

export type AnswerStep = { title: string; via?: string };

/** Answer produced by the deterministic local engine (lib/knowledge.ts). */
export type AnswerResult = {
  title: string;
  answer: string;
  evidence: string[];
  path: AnswerStep[];
};

export type AnswerEvidence = {
  id: string;
  kind: string;
  label: string;
  excerpt: string;
};

/** Answer produced by the DB-backed ask engine (POST /api/ask). */
export type AskResult = {
  title: string;
  answer: string;
  evidence: AnswerEvidence[];
  path: AnswerStep[];
};
