import "server-only";
import { database } from "@/lib/database";

export type RelationshipResult = {
  entityId: string;
  relationships: Array<{
    direction: "incoming" | "outgoing";
    label: string;
    target: { id: string; kind: string; label: string; summary: string; meta: string | null };
  }>;
};

export async function getDirectRelationships(entityId: string): Promise<RelationshipResult> {
  const { rows } = await database().query(
    `WITH edges AS (
      SELECT client_id AS from_id, project_id AS to_id, 'owns project'::text AS label FROM project_clients
      UNION ALL SELECT person_id, project_id, CASE WHEN is_lead THEN 'leads' ELSE 'works on' END FROM project_team
      UNION ALL SELECT project_id, topic_id, 'uses topic' FROM project_topics
      UNION ALL SELECT project_id, decision_id, 'has decision' FROM decision_projects
      UNION ALL SELECT person_id, decision_id, CASE WHEN relationship = 'owner' THEN 'made by' ELSE 'participated' END FROM decision_people
      UNION ALL SELECT decision_id, topic_id, 'about' FROM decision_topics
      UNION ALL SELECT document_id, project_id, relationship_label FROM document_projects
      UNION ALL SELECT document_id, topic_id, relationship_label FROM document_topics
      UNION ALL SELECT document_id, decision_id, relationship_label FROM document_decisions
      UNION ALL SELECT document_id, person_id, relationship_label FROM document_people
      UNION ALL SELECT person_id, message_id, relationship_label FROM message_people
      UNION ALL SELECT message_id, project_id, relationship_label FROM message_projects
      UNION ALL SELECT message_id, topic_id, relationship_label FROM message_topics
    ), nodes AS (
      SELECT id, 'client'::text AS kind, name AS label, notes AS summary, concat_ws(' · ', industry, status::text) AS meta FROM clients
      UNION ALL SELECT id, 'project', name, description, status::text FROM projects
      UNION ALL SELECT id, 'person', name, array_to_string(skills, ', '), role FROM people
      UNION ALL SELECT id, 'decision', title, summary, decided_at::text FROM decisions
      UNION ALL SELECT id, 'topic', name, description, NULL FROM topics
      UNION ALL SELECT id, 'document', title, summary, source_type FROM documents
      UNION ALL SELECT id, 'message', concat('Message in #', channel), body, occurred_at::text FROM messages
    )
    SELECT
      CASE WHEN edges.from_id = $1::uuid THEN 'outgoing' ELSE 'incoming' END AS direction,
      edges.label,
      nodes.id, nodes.kind, nodes.label AS target_label, nodes.summary, nodes.meta
    FROM edges
    JOIN nodes ON nodes.id = CASE WHEN edges.from_id = $1::uuid THEN edges.to_id ELSE edges.from_id END
    WHERE edges.from_id = $1::uuid OR edges.to_id = $1::uuid
    ORDER BY nodes.kind, nodes.label`,
    [entityId],
  );

  return {
    entityId,
    relationships: rows.map((row) => ({
      direction: row.direction,
      label: row.label,
      target: {
        id: row.id,
        kind: row.kind,
        label: row.target_label,
        summary: row.summary,
        meta: row.meta,
      },
    })),
  };
}
