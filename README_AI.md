# 🤖 AI Agent Codebase Map: FounderOS

> **Notice to AI Agents (Perplexity, Groq, Cursor, Claude, etc.):**
> If you are reading this file, you are tasked with understanding, refactoring, or maintaining FounderOS. This document maps the architecture of the codebase so you know exactly where to look for specific logic.

FounderOS is a Next.js 14 (App Router) application. It acts as a highly complex, stateful forensic analysis engine for startup ideas.

---

## 🗺️ High-Level Directory Structure

```text
d:\founderOs\
├── src/
│   ├── app/                # Next.js App Router (Pages & API)
│   ├── components/         # React Components
│   ├── context/            # React Context Providers (Theme)
│   └── lib/                # Core Backend Logic / Utilities
├── scripts/                # Database Seeding & Data structures
└── ...                     # Configs (Tailwind not used, vanilla CSS used)
```

---

## 🧩 Key Files & Where to Find Things

### 1. The Frontend (UI & Interactions)
*   **`src/app/page.tsx`**
    *   **What it is:** The massive main single-page application (SPA).
    *   **What it does:** Handles the onboarding question flow ("The Flip"), state management for the entire UI, queue polling, and rendering the final Forensic Report (including Recharts & Chart.js visualizations).
    *   **Edit this if:** You need to change the UI layout, add a new question to the flow, modify the radar chart, or alter the queue polling frontend logic.
*   **`src/app/globals.css`**
    *   **What it is:** The global stylesheet.
    *   **What it does:** Defines the entire "Dark Luxury" design system using CSS Variables (`--bg-base`, `--accent`, etc.). Contains both Light and Dark mode variable definitions.
    *   **Edit this if:** You need to change colors, spacing, or global animations.

### 2. UI Components
*   **`src/components/AIAdvisorOrb.tsx`**
    *   **What it is:** The floating, interactive chatbot that appears when the report is ready.
    *   **What it does:** Allows the user to ask follow-up questions about their forensic report. It maintains chat state and calls `/api/chat`.
*   **`src/components/SettingsPanel.tsx`**
    *   **What it is:** The slide-out settings sidebar.
    *   **What it does:** Manages user profile viewing, theme toggling, and links out to terms/privacy.

### 3. The Core Backend Engine (The Brain)
*   **`src/lib/analysis.ts`**
    *   **What it is:** The absolute core of the forensic engine.
    *   **What it does:** Contains the `runForensicAgents` function, which executes the **8-Agent Pipeline** using the Groq SDK (`llama-3.1-8b-instant`). It defines the `CYNICAL_ROLE` prompt and the specific JSON output schemas for every agent.
    *   **Edit this if:** You want to add a new forensic agent, change the AI prompt, modify the mathematical scoring logic, or add new data fields to the final report.

### 4. The API Routes (`src/app/api/...`)
FounderOS uses a decoupled queue architecture because the 8-agent pipeline takes too long for a standard Vercel serverless function (which times out at 15-60s on free tiers).

*   **`/api/analyze/route.ts`**
    *   Receives the user's idea, generates a unique `queue_id`, inserts it into the `queued_analyses` Supabase table, and immediately triggers the background worker. Returns the `queue_id` to the frontend.
*   **`/api/process-queue/route.ts`**
    *   The background worker. It reads the queue, calls `runForensicAgents` (from `src/lib/analysis.ts`), and saves the final result back to the Supabase database.
*   **`/api/check-queue/route.ts`**
    *   The polling endpoint. The frontend (`page.tsx`) constantly pings this to get real-time progress updates (e.g., "Agent 3/8 complete") until the final report is ready.
*   **`/api/chat/route.ts`**
    *   Powers the `AIAdvisorOrb`. It takes the user's message and the full context of the generated report, and streams back an AI response using Groq.
*   **Authentication Routes:**
    *   `/api/send-otp/route.ts` & `/api/verify-otp/route.ts` handle passwordless email login.

### 5. The Database & Knowledge Context
*   **`scripts/seed_database.ts`**
    *   **What it is:** The static knowledge injection script.
    *   **What it does:** Contains massive arrays of hardcoded data: historical startup failures (`postmortemData`), market insights specifically for India (`indiaInsights`), and market size estimations. This data is pushed to Supabase and is used to ground the LLM's analysis.
    *   **Edit this if:** You want to teach the AI about new startup failures, new market trends, or update TAM/SAM data.

---

## 🚦 Important Architectural Rules for Agents

1.  **Strict Type Casting:** When passing numeric scores from the database/AI to the frontend UI (especially in CSS variables like `--score` or `width`), ALWAYS cast them using `Number()` with a fallback (e.g., `Number(score) || 0`). Failing to do so causes React hydration errors.
2.  **No Tailwind:** Do not use Tailwind classes. FounderOS uses vanilla CSS in `globals.css` to manage its Dark Luxury aesthetic. Stick to standard CSS and CSS variables.
3.  **JSON Strictness:** The agents in `src/lib/analysis.ts` are instructed to return `response_format: { type: 'json_object' }`. If you modify the prompts, ensure they explicitly state "Return ONLY valid JSON" to avoid pipeline parsing crashes.
4.  **Error Handling (Rate Limits):** The `callWithRetry` function in the analysis library handles Groq 429 rate limits. Do not remove this logic, as it is critical for production stability.
