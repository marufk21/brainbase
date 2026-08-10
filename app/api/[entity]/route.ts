import { ApiError, isEntity, list, create } from "@/lib/server/entity-api";

export const runtime = "nodejs";

export async function GET(_request: Request, context: RouteContext<"/api/[entity]">) {
  const { entity } = await context.params;
  if (!isEntity(entity)) return Response.json({ error: "Unknown entity" }, { status: 404 });
  return respond(() => list(entity));
}

export async function POST(request: Request, context: RouteContext<"/api/[entity]">) {
  const { entity } = await context.params;
  if (!isEntity(entity)) return Response.json({ error: "Unknown entity" }, { status: 404 });
  return respond(() => request.json().then((body) => create(entity, body)), 201);
}

async function respond(operation: () => Promise<unknown>, success = 200) {
  try {
    return Response.json(await operation(), { status: success });
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 503;
    return Response.json(
      { error: error instanceof Error ? error.message : "Database request failed" },
      { status },
    );
  }
}
