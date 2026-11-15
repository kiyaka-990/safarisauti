"use client";

import { useEffect, useRef, useState } from "react";

interface CatalogItem {
  id: number; kind: string; name: string; priceKes: number; days: number; location: string;
}
interface Itinerary {
  items: CatalogItem[]; totalKes: number; totalDays: number;
}
interface FeedEvent { at: string; type: string; msg: string }
interface ApiResponse {
  reply: string;
  phase: string;
  itinerary: Itinerary | null;
  budget: { capKes: number; spentKes: number };
  error?: string;
}

const ICONS: Record<string, string> = {
  search: "🔍", plan: "🗺️", pay: "💳", say: "💬", confirm: "✅",
};

export default function Concierge() {
  const sessionId = useRef<string>(`s-${Date.now()}`);
  const [brief, setBrief] = useState(
    "5-day safari for two in October, under KES 250k, want to see the big five"
  );
  const [messages, setMessages] = useState<
    { role: "user" | "agent"; text: string }[]
  >([
    {
      role: "agent",
      text: "Karibu! Tell me your dream East Africa trip — dates, party size, budget.",
    },
  ]);
  const [feed, setFeed] = useState<FeedEvent[]>([]);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [phase, setPhase] = useState("planning");
  const [budget, setBudget] = useState<{ capKes: number; spentKes: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const es = new EventSource("/api/events");
    es.onmessage = (e) => setFeed((f) => [...f, JSON.parse(e.data)]);
    return () => es.close();
  }, []);

  useEffect(() => {
    feedRef.current?.scrollTo({
      top: feedRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [feed]);

  async function send(text: string) {
    const msg = text.trim();
    if (!msg || busy) return;
    setBusy(true);
    setMessages((m) => [...m, { role: "user", text: msg }]);
    setBrief("");
    try {
      const r = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sessionId.current, brief: msg }),
      });
      const data: ApiResponse = await r.json();
      setMessages((m) => [
        ...m,
        { role: "agent", text: data.reply ?? `Error: ${data.error}` },
      ]);
      setItinerary(data.itinerary);
      setPhase(data.phase);
      setBudget(data.budget);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "agent", text: "Network hiccup — try again." },
      ]);
    } finally {
      setBusy(false);
    }
  }

  function startVoice() {
    const SR =
      (window as any).webkitSpeechRecognition ?? (window as any).SpeechRecognition;
    if (!SR) {
      alert("Voice not supported in this browser — use Chrome.");
      return;
    }
    const rec = new SR();
    rec.lang = "en-KE";
    rec.onresult = (e: any) => setBrief(e.results[0][0].transcript);
    rec.start();
  }

  return (
    <main
      style={{
        maxWidth: 1000,
        margin: "0 auto",
        padding: 24,
        display: "grid",
        gridTemplateColumns: "3fr 2fr",
        gap: 24,
      }}
    >
      <section>
        <h1 style={{ marginTop: 0 }}>🦁 SafariSauti</h1>
        <p style={{ color: "#81c784", marginTop: 0 }}>
          Your AI safari concierge — plans it, prices it, books it. M-Pesa ready.
        </p>

        <div
          style={{
            border: "1px solid #2e5339",
            borderRadius: 12,
            padding: 16,
            minHeight: 300,
            maxHeight: 400,
            overflowY: "auto",
          }}
        >
          {messages.map((m, i) => (
            <div
              key={i}
              style={{ textAlign: m.role === "user" ? "right" : "left", margin: "8px 0" }}
            >
              <span
                style={{
                  display: "inline-block",
                  padding: "8px 12px",
                  borderRadius: 12,
                  background: m.role === "user" ? "#1b5e20" : "#1d2b22",
                }}
              >
                {m.text}
              </span>
            </div>
          ))}
          {busy && <p style={{ color: "#a5d6a7" }}>Agent working…</p>}
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <input
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(brief)}
            placeholder="Describe your trip…"
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 8,
              border: "1px solid #2e5339",
              background: "#12211a",
              color: "inherit",
            }}
          />
          <button onClick={startVoice} title="Voice input" style={btn}>
            🎙️
          </button>
          <button
            onClick={() => send(brief)}
            disabled={busy}
            style={{ ...btn, background: "#2e7d32", color: "#fff" }}
          >
            Send
          </button>
        </div>

        {itinerary && (
          <div
            style={{
              marginTop: 16,
              border: "1px solid #2e5339",
              borderRadius: 12,
              padding: 16,
            }}
          >
            <h3 style={{ marginTop: 0 }}>
              Proposed itinerary — {itinerary.totalDays} days · KES{" "}
              {itinerary.totalKes.toLocaleString()}
            </h3>
            <ul style={{ margin: 0 }}>
              {itinerary.items.map((i) => (
                <li key={i.id}>
                  {i.kind === "safari" ? "🛖" : i.kind === "flight" ? "✈️" : "🏨"}{" "}
                  {i.name} — KES {i.priceKes.toLocaleString()} ({i.location})
                </li>
              ))}
            </ul>
            {budget && (
              <p style={{ color: "#ffb74d" }}>
                Budget: KES {budget.spentKes.toLocaleString()} spent of{" "}
                {budget.capKes.toLocaleString()} cap
                {phase === "awaiting_confirmation" &&
                  " — confirm in chat with your phone number to pay via M-Pesa"}
                {phase === "paid" && " — PAID ✓"}
              </p>
            )}
          </div>
        )}
      </section>

      <section>
        <h3>⚡ Live agent feed</h3>
        <div
          ref={feedRef}
          style={{
            border: "1px solid #2e5339",
            borderRadius: 12,
            padding: 12,
            minHeight: 400,
            maxHeight: 600,
            overflowY: "auto",
            fontSize: 13,
          }}
        >
          {feed.length === 0 && (
            <p style={{ color: "#66806e" }}>
              Agent activity will appear here in real time…
            </p>
          )}
          {feed.map((e, i) => (
            <div
              key={i}
              style={{ padding: "4px 0", borderBottom: "1px solid #1a2c21" }}
            >
              <span style={{ color: "#66806e" }}>
                {new Date(e.at).toLocaleTimeString()}{" "}
              </span>
              {ICONS[e.type] ?? "•"} {e.msg}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

const btn: React.CSSProperties = {
  padding: "12px 16px",
  borderRadius: 8,
  border: "1px solid #2e5339",
  background: "#12211a",
  color: "inherit",
  cursor: "pointer",
};