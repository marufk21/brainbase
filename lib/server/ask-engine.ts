import "server-only";
import { database } from "@/lib/server/database";
import { getDirectRelationships } from "@/lib/server/relationships";
import type { AskResult, GraphNode } from "@/lib/types";

export type { AskResult } from "@/lib/types";

export async function answerFromKnowledgeGraph(question: string): Promise<AskResult> {
  if (!question.trim()) throw new Error("Question is required");
  const nodes = await findEntities(question);
  const relations = await Promise.all(
    nodes.slice(0, 3).map((node) => getDirectRelationships(node.id)),
  );
  const direct = relations.flatMap((result) => result.relationships);
  const lower = question.toLowerCase();
  const evidence = unique([
    ...nodes.map((node) => ({
      id: node.id,
      kind: node.kind,
      label: node.label,
      excerpt: node.summary,
    })),
    ...direct.map((relation) => ({
      id: relation.target.id,
      kind: relation.target.kind,
      label: relation.target.label,
      excerpt: relation.target.summary,
    })),
  ]).slice(0, 8);

  if (!nodes.length)
    return {
      title: "No connected records found",
      answer:
        "I could not find a matching entity in the knowledge database. Try a project, client, person, decision, document, or topic name.",
      evidence: [],
      path: [],
    };
  const project = nodes.find((node) => node.kind === "project");
  const decision =
    nodes.find((node) => node.kind === "decision") ??
    direct.find((relation) => relation.target.kind === "decision")?.target;
  const people = direct
    .filter((relation) => relation.target.kind === "person")
    .map((relation) => relation.target.label);

  if (project && (lower.includes("who") || lower.includes("worked") || lower.includes("team"))) {
    return {
      title: `${project.label}: team and linked decisions`,
      answer: `${project.label} is connected to ${people.length ? people.join(", ") : "no recorded team members"}. ${decision ? `A linked decision is “${decision.label}”: ${decision.summary}` : "No linked decision was found."}`,
      evidence,
      path: [
        { title: project.label },
        ...direct.slice(0, 6).map((relation) => ({
          title: relation.target.label,
          via: relation.label,
        })),
      ],
    };
  }
  if (lower.includes("slack") && decision) {
    return {
      title: "Slack scope decision",
      answer: `${decision.summary} The related people, project, topics, documents, and messages below are direct evidence from the knowledge graph.`,
      evidence,
      path: [
        { title: decision.label },
        ...direct.slice(0, 6).map((relation) => ({
          title: relation.target.label,
          via: relation.label,
        })),
      ],
    };
  }
  const primary = nodes[0];
  return {
    title: `Connected knowledge about ${primary.label}`,
    answer: `${primary.summary} It is directly connected to ${
      direct
        .slice(0, 4)
        .map((relation) => relation.target.label)
        .join(", ") || "no other records yet"
    }.`,
    evidence,
    path: [
      { title: primary.label },
      ...direct.slice(0, 6).map((relation) => ({
        title: relation.target.label,
        via: relation.label,
      })),
    ],
  };
}

async function findEntities(question: string): Promise<GraphNode[]> {
  const tokens = [...new Set(question.toLowerCase().match(/[a-z][a-z0-9-]{2,}/g) ?? [])].filter(
    (token) =>
      ![
        "what",
        "that",
        "with",
        "from",
        "about",
        "show",
        "worked",
        "project",
        "decision",
        "knowledge",
        "brainbase",
      ].includes(token),
  );
  if (!tokens.length) return [];
  const { rows } = await database().query(
    `WITH nodes AS (
      SELECT id, 'client'::text kind, name label, notes summary FROM clients UNION ALL
      SELECT id, 'project', name, description FROM projects UNION ALL
      SELECT id, 'person', name, array_to_string(skills, ', ') FROM people UNION ALL
      SELECT id, 'decision', title, summary FROM decisions UNION ALL
      SELECT id, 'topic', name, description FROM topics UNION ALL
      SELECT id, 'document', title, summary FROM documents
    ) SELECT *, (SELECT count(*) FROM unnest($1::text[]) token WHERE lower(label) LIKE '%' || token || '%') AS score
    FROM nodes WHERE EXISTS (SELECT 1 FROM unnest($1::text[]) token WHERE lower(label) LIKE '%' || token || '%')
    ORDER BY score DESC, label LIMIT 6`,
    [tokens],
  );
  return rows;
}

function unique<T extends { id: string }>(items: T[]) {
  return [...new Map(items.map((item) => [item.id, item])).values()];
}
