import { database } from "@/lib/database";
export const runtime = "nodejs";
export async function GET() {
  try {
    const db = database();
    const [
      clients,
      people,
      projects,
      topics,
      decisions,
      documents,
      messages,
      pc,
      pt,
      pj,
      dp,
      dpe,
      dt,
      docp,
      doct,
      mp,
    ] = await Promise.all(
      [
        "clients",
        "people",
        "projects",
        "topics",
        "decisions",
        "documents",
        "messages",
        "project_clients",
        "project_team",
        "project_topics",
        "decision_projects",
        "decision_people",
        "decision_topics",
        "document_projects",
        "document_topics",
        "message_people",
      ].map((t) => db.query(`SELECT * FROM ${t}`)),
    );
    return Response.json({
      clients: clients.rows,
      people: people.rows,
      projects: projects.rows,
      topics: topics.rows,
      decisions: decisions.rows,
      documents: documents.rows,
      messages: messages.rows,
      edges: {
        pc: pc.rows,
        pt: pt.rows,
        pj: pj.rows,
        dp: dp.rows,
        dpe: dpe.rows,
        dt: dt.rows,
        docp: docp.rows,
        doct: doct.rows,
        mp: mp.rows,
      },
    });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Database unavailable" },
      { status: 503 },
    );
  }
}
