import { subscribe, recent, type Event } from "@/lib/events";

export const dynamic = "force-dynamic";

export async function GET() {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const send = (e: Event) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(e)}\n\n`));
      recent().forEach(send);
      const unsub = subscribe(send);
      const keepAlive = setInterval(
        () => controller.enqueue(encoder.encode(": ping\n\n")),
        15000
      );
      return () => {
        unsub();
        clearInterval(keepAlive);
      };
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
