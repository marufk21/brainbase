import { ApiError, get, isEntity, remove, update } from "@/lib/entity-api";

export const runtime = "nodejs";

export async function GET(_request: Request, context: RouteContext<"/api/[entity]/[id]">) {
  const { entity, id } = await context.params;
  if (!isEntity(entity)) return Response.json({ error: "Unknown entity" }, { status: 404 });
  return respond(async () => (await get(entity, id)) ?? notFound());
}

export async function PUT(request: Request, context: RouteContext<"/api/[entity]/[id]">) {
  const { entity, id } = await context.params;
  if (!isEntity(entity)) return Response.json({ error: "Unknown entity" }, { status: 404 });
  return respond(async () => (await update(entity, id, await request.json())) ?? notFound());
}

export async function DELETE(_request: Request, context: RouteContext<"/api/[entity]/[id]">) {
  const { entity, id } = await context.params;
  if (!isEntity(entity)) return Response.json({ error: "Unknown entity" }, { status: 404 });
  return respond(async () => (await remove(entity, id)) ? null : notFound(), 204);
}

function notFound(): never { throw new ApiError(404, "Record not found"); }
async function respond(operation: () => Promise<unknown>, success = 200) {
  try { const result = await operation(); return success === 204 ? new Response(null, { status: 204 }) : Response.json(result, { status: success }); }
  catch (error) { const status = error instanceof ApiError ? error.status : 503; return Response.json({ error: error instanceof Error ? error.message : "Database request failed" }, { status }); }
}
