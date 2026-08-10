import { getDirectRelationships } from "@/lib/relationships";

export const runtime = "nodejs";

export async function GET(_request: Request, context: RouteContext<"/api/relationships/[id]">) {
  const { id } = await context.params;
  try {
    return Response.json(await getDirectRelationships(id));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Relationship query failed";
    const isInvalidId = /invalid input syntax for type uuid/i.test(message);
    return Response.json({ error: isInvalidId ? "Entity ID must be a UUID" : message }, { status: isInvalidId ? 400 : 503 });
  }
}
