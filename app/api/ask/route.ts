import { answerFromKnowledgeGraph } from "@/lib/server/ask-engine";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { question } = await request.json();
    return Response.json(await answerFromKnowledgeGraph(String(question ?? "")));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to answer question";
    return Response.json(
      { error: message },
      { status: message === "Question is required" ? 400 : 503 },
    );
  }
}
