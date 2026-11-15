# SafariSauti — Requirements

## Overview
AI Safari Concierge: one-sentence trip brief in → within-budget East Africa
itinerary out → explicit user confirmation → agent books and collects
payment via M-Pesa STK Push (sandbox) with a live activity feed.

## Functional
- FR1: Accept natural-language brief (dates, party size, budget KES, interests).
- FR2: Search catalog (safaris, flights, lodges); compose itinerary <= budget.
- FR3: Budget cap enforced in code (budget.ts), never trusted to the LLM.
- FR4: No payment without explicit user confirmation (human-in-the-loop).
- FR5: M-Pesa Daraja STK Push; simulation mode when keys absent.
- FR6: All agent steps stream to a live activity feed (SSE).
- FR7: Voice input via browser Speech API; text fallback always available.

## Non-functional
Next.js 15 App Router + TypeScript, Vercel deployable, sandbox-only money.
