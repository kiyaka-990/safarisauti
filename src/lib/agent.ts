import { generateText, tool } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import { searchCatalog, type Kind } from "./catalog";
import { buildItinerary, type Itinerary } from "./planner";
import { charge, assertWithinBudget, type Budget } from "./budget";
import { emit } from "./events";
import { stkPush } from "./mpesa";

export interface AgentState {
  budget: Budget;
  itinerary: Itinerary | null;
  phase: "planning" | "awaiting_confirmation" | "paid" | "blocked";
}

const model = createOpenAI({ apiKey: process.env.OPENAI_API_KEY! })("gpt-4o-mini");

export async function runAgent(
  brief: string,
  state: AgentState
): Promise<{ state: AgentState; text: string }> {
  const tools = {
    searchCatalog: tool({
      description: "Search safaris, flights or lodges. Optionally cap price.",
      parameters: z.object({
        kind: z.enum(["safari", "flight", "lodge"]),
        maxKes: z.number().optional(),
      }),
      execute: async ({ kind, maxKes }) => {
        emit("search", `Searching ${kind}s${maxKes ? ` under KES ${maxKes.toLocaleString()}` : ""}`);
        return searchCatalog(kind as Kind, maxKes);
      },
    }),
    proposeItinerary: tool({
      description: "Assemble catalog item ids into a budget-checked itinerary.",
      parameters: z.object({ itemIds: z.array(z.number()) }),
      execute: async ({ itemIds }) => {
        emit("plan", `Composing itinerary from ${itemIds.length} items`);
        const it = buildItinerary(itemIds, state.budget); // throws if over budget
        state.itinerary = it;
        state.phase = "awaiting_confirmation";
        return { itinerary: it, totalKes: it.totalKes, days: it.totalDays };
      },
    }),
    requestPayment: tool({
      description:
        "Request M-Pesa STK push. ONLY valid after user explicitly confirmed. " +
        "Agent must ask the user for their phone number and confirmation first.",
      parameters: z.object({
        phone: z.string().regex(/^2547\d{8}$/, "Use format 2547XXXXXXXX"),
        amountKes: z.number(),
      }),
      execute: async ({ phone, amountKes }) => {
        if (state.phase !== "awaiting_confirmation" || !state.itinerary) {
          return { ok: false, error: "Blocked: user has not confirmed the plan yet." };
        }
        if (amountKes !== state.itinerary.totalKes) {
          return { ok: false, error: "Amount mismatch with itinerary total." };
        }
        // Defense in depth: re-verify cap at payment time, in code.
        assertWithinBudget(state.budget, amountKes, "final checkout");
        emit("pay", `Initiating M-Pesa STK push → ${phone} for KES ${amountKes.toLocaleString()}`);
        const res = await stkPush(phone, amountKes, "SafariSauti booking");
        if (res.ok) {
          state.budget = charge(state.budget, amountKes, "booking");
          state.phase = "paid";
          emit("pay", `Payment received ✓ ref ${res.ref}`);
        } else {
          state.phase = "blocked";
          emit("pay", `Payment failed: ${res.error}`);
        }
        return res;
      },
    }),
  };

  const { text } = await generateText({
    model,
    tools,
    toolChoice: "auto",
    maxSteps: 10,
    system:
      "You are SafariSauti, an East Africa safari concierge agent. " +
      "Use tools to search and propose. NEVER claim the trip is booked or paid " +
      "— payments only happen after the user explicitly confirms the plan and " +
      "gives a phone number. If tools report a budget violation, apologize and " +
      "propose cheaper alternatives. Keep replies under 80 words.",
    prompt:
      `User brief: ${brief}\nCurrent state: phase=${state.phase} ` +
      `budget=${JSON.stringify(state.budget)}` +
      (state.itinerary
        ? `\nItinerary so far: ${JSON.stringify(state.itinerary.items.map((i) => i.name))} total=${state.itinerary.totalKes}`
        : ""),
  });

  emit("say", text);
  return { state, text };
}
