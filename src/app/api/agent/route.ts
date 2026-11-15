import { NextResponse } from "next/server";
import { runAgent, type AgentState } from "@/lib/agent";

// Session state per conversation (demo: keyed in-memory; use KV in prod).
const sessions = new Map<string, AgentState>();

export async function POST(req: Request) {
  const body = await req.json();
  const { sessionId, brief } = body;
  if (!sessionId || typeof brief !== "string" || !brief.trim()) {
    return NextResponse.json({ error: "sessionId and brief required" }, { status: 400 });
  }

  let state = sessions.get(sessionId);
  if (!state) {
    // Extract a KES budget from the brief if present; default 200,000.
    const m = brief.replace(/,/g, "").match(/(\d+)\s*(?:k\b|kes)/i);
    const capKes = m ? Number(m[1]) * 1000 : 200000;
    state = { budget: { capKes, spentKes: 0 }, itinerary: null, phase: "planning" };
    sessions.set(sessionId, state);
  }

  try {
    const { state: newState, text } = await runAgent(brief, state);
    sessions.set(sessionId, newState);
    return NextResponse.json({
      reply: text,
      phase: newState.phase,
      itinerary: newState.itinerary,
      budget: newState.budget,
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
