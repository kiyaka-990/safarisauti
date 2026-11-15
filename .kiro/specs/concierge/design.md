# Design

Client (`page.tsx` + `Concierge.tsx`) -> `/api/agent` (agent loop) -> tools:
- searchCatalog  -> catalog.ts
- proposeItinerary -> planner.ts (budget-checked)
- requestPayment -> mpesa.ts (phase gate + budget re-check)

`events.ts` is an in-memory pub/sub; `/api/events` streams SSE to the UI
so judges watch the agent work live. State machine:
planning -> awaiting_confirmation -> paid | blocked.

## Payment safety (defense in depth)
1. Itinerary assembly is budget-checked in `planner.ts` (throws if over cap).
2. Payment tool refuses unless phase == "awaiting_confirmation".
3. Amount must equal itinerary total (no amount tampering via LLM).
4. `assertWithinBudget` re-verified at payment time before STK push.
The LLM never holds payment authority; it can only *request* actions.
