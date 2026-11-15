# SafariSauti 🦁 — AI Safari Concierge

Say what you want. "5-day safari for two under KES 250k in October."
The agent searches safaris, flights and lodges, builds an itinerary
**within your budget (enforced in code, not by prompt)**, shows you the
plan, waits for your confirmation, then books it and collects payment via
**M-Pesa STK Push** — while you watch every step live.

## Run
```bash
cp .env.example .env.local   # add your OPENAI_API_KEY
npm install
npm run dev
```

## Demo flow
1. Send a trip brief ("5-day safari for two under KES 250k, big five").
2. Watch the live agent feed: searches → itinerary proposal → total.
3. Confirm in chat with your phone number ("Yes, confirm — 2547XXXXXXXX").
4. M-Pesa STK push fires (sandbox/simulated) → **PAID ✓**.

## Stack
Next.js 15 · Vercel AI SDK · SSE · Safaricom Daraja (sandbox) · Browser Speech API

## Safety design
- Budget cap enforced in `src/lib/budget.ts` (code, not prompt).
- Payment tool gated on explicit user confirmation (human-in-the-loop).
- Amount re-verified against itinerary total and cap at payment time.

## Disclosure (Kiroween rules)
Payment-request patterns are informed by prior work in my repo
`kiyaka-990/afripay` (pre-existing, disclosed per "New Projects Only").
All project code was written during the submission window using Kiro.
No real money moves in this build; demo mode simulates payments.
