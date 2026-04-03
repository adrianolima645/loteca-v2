# Research & Design Decisions

---
**Purpose**: Capture discovery findings, architectural investigations, and rationale that inform the technical design.

---

## Summary

- **Feature**: `loteca-platform`
- **Discovery Scope**: New Feature (Greenfield)
- **Key Findings**:
  - The project is a fresh Next.js 16 / React 19 / TypeScript 5 App Router scaffold with no existing domain logic — full architecture freedom but also full responsibility.
  - Next.js 16 App Router consolidates server and client rendering; Server Actions replace REST endpoints for most mutations, reducing boilerplate.
  - MongoDB + Mongoose is the selected database stack per explicit project requirement. Embedding strategies (matches inside rounds, selections inside bet slips) reduce join complexity and align with MongoDB's document model.
  - Real-time leaderboard updates (Req 6.3) require a lightweight push mechanism; Server-Sent Events (SSE) via a Next.js Route Handler are sufficient and require no additional infrastructure for an MVP.
  - Scoring recalculation (Req 4.8, 9.5) is a background job concern — modelled as an idempotent async operation callable from a Server Action with optimistic locking on the round/championship state.

---

## Research Log

### Technology Stack Evaluation

- **Context**: Greenfield project on Next.js 16 + React 19. Need to pick ORM, auth, real-time, and notification layers.
- **Sources Consulted**: Package.json (project), AGENTS.md (breaking-changes warning), internal knowledge of Next.js 16 App Router patterns.
- **Findings**:
  - Next.js 16 uses the App Router exclusively; Pages Router is deprecated. Route Handlers replace API Routes. Server Actions replace form POST handlers.
  - React 19 ships `useOptimistic` and `useActionState` — important for bet submission UX.
  - `next-auth` v5 (Auth.js 5) is the canonical auth library for Next.js App Router; Google OAuth provider selected per explicit project requirement — no password storage.
  - Mongoose 8 + MongoDB: selected per explicit project requirement. Mongoose provides schema-level type safety and a familiar model API; `mongodb-memory-server` enables fast unit/integration tests without a running Atlas instance.
  - No WebSearch available; conclusions based on documented stable APIs as of late 2025.
- **Implications**:
  - All mutations (bet submission, round management, score publishing) use Server Actions — no REST endpoints needed.
  - Authentication middleware via Auth.js 5 + Google OAuth handles session guards at the route level; no credentials flow required.
  - Mongoose schema definitions with TypeScript interfaces enforce typed documents; `as` casts discouraged — use `HydratedDocument<T>` generics.

### Real-Time Leaderboard Strategy

- **Context**: Req 6.3 requires standings to update without manual refresh.
- **Sources Consulted**: Next.js Route Handler SSE documentation, React 19 patterns.
- **Findings**:
  - Server-Sent Events via a Route Handler (`GET /api/leaderboard/[championshipId]/stream`) is the simplest approach: text/event-stream, no external broker.
  - WebSockets require a dedicated server and are overkill for uni-directional score push.
  - Polling (React `setInterval`) is viable as a fallback but degrades server performance at scale.
- **Implications**:
  - LeaderboardStreamHandler is a Route Handler returning `text/event-stream`.
  - Client uses the native `EventSource` API wrapped in a React hook.
  - On score recalculation, the Scoring Engine emits an in-process event consumed by the SSE handler.

### Scoring Engine Design

- **Context**: Req 4 requires configurable per-league weight multipliers, draw-conditional application, and re-calculation support.
- **Sources Consulted**: Domain analysis of requirements.
- **Findings**:
  - The scoring rule is: `points = Σ correct_predictions × (match_is_draw ? league_multiplier : base_multiplier)`. The `base_multiplier` defaults to 1.0.
  - Rule sets are championship-scoped (Req 9.2), enabling different scoring per competition.
  - Re-calculation must be idempotent: delete existing `RoundScore` rows for the target round+championship, then recompute from stored `BetSelection` and `MatchResult` records.
- **Implications**:
  - `ScoringRuleSet` entity stores base points + array of `LeagueWeight` value objects.
  - `ScoreCalculationService` is a pure domain service: given a `Round`, a `Championship`, and its `ScoringRuleSet`, it produces `UserRoundScore` records.
  - Admin-triggered recalculation calls a Server Action that delegates to `ScoreCalculationService`.

### Notification Architecture

- **Context**: Req 10 requires in-platform notifications + optional email.
- **Sources Consulted**: Domain analysis.
- **Findings**:
  - In-platform notifications can be stored in a `Notification` table and fetched on page load / SSE push.
  - Email delivery needs an external provider (Resend, SendGrid, Nodemailer). Given greenfield scope, a pluggable `EmailProvider` interface avoids hard-coding a vendor.
  - Notification fan-out (all users on round open) should be async — queued as background tasks, not inline in the Server Action.
- **Implications**:
  - `NotificationService` interface with two implementations: `InPlatformNotificationService` (DB write) and `EmailNotificationService` (external provider).
  - Background queue: Next.js cron via Vercel Cron Jobs or a simple DB-backed job queue (for MVP).

---

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| Layered (Feature-based modules) | Route → Server Action → Service → Repository → Mongoose | Simple mental model, matches Next.js App Router conventions | Can become a spaghetti service layer if boundaries aren't enforced | **Selected** — matches greenfield Next.js 16 idioms |
| Hexagonal (Ports & Adapters) | Domain core with adapters for DB, email, real-time | Excellent testability, clear boundaries | Significant boilerplate for a small team | Good long-term target; MVP does not justify the overhead |
| Full Microservices | Separate services for scoring, auth, notifications | Independent scaling | Operational complexity is disproportionate for a social betting MVP | Rejected |

**Selected**: Feature-module layered architecture with clear domain service boundaries, co-located with Next.js App Router folder conventions (`/app/(admin)/...`, `/app/(user)/...`).

---

## Design Decisions

### Decision: Server Actions as Primary Mutation Layer

- **Context**: Next.js 16 App Router deprecates `/api` route endpoints for most mutations.
- **Alternatives Considered**:
  1. REST API routes (`/api/bets`, `/api/rounds`) — familiar but deprecated pattern in Next.js 16.
  2. Server Actions — co-located with UI, typed end-to-end, no client-side fetch boilerplate.
- **Selected Approach**: Server Actions for all mutations; Route Handlers only for SSE streaming and webhooks.
- **Rationale**: Reduces code surface, type-safe by default, integrates with `useActionState` in React 19.
- **Trade-offs**: Server Actions are less visible than REST routes; mitigated by co-location and clear naming conventions.
- **Follow-up**: Confirm Server Action size limits and streaming behavior in Next.js 16 docs.

### Decision: MongoDB + Mongoose ODM

- **Context**: Explicit project requirement to use MongoDB and Mongoose.
- **Alternatives Considered**:
  1. PostgreSQL + Prisma — strongest relational integrity, but rejected per project requirement.
  2. MongoDB + native driver — lower-level, loses Mongoose schema validation and TypeScript model typing.
- **Selected Approach**: MongoDB 7 (Atlas) + Mongoose 8.
- **Rationale**: Explicit requirement. MongoDB's document model maps naturally to embedded sub-documents (matches in rounds, selections in bet slips), reducing query round-trips for the most common access patterns.
- **Trade-offs**: No native foreign-key constraints — referential integrity enforced at the service layer. Multi-document transactions available but avoided by using embedding where possible.
- **Follow-up**: Use `mongodb-memory-server` for integration tests; cache Mongoose connection in `lib/db.ts` singleton for serverless cold-start performance.

### Decision: Auth.js v5 with Google OAuth Provider

- **Context**: Explicit project requirement to use Google as the authentication provider. No password-based registration.
- **Alternatives Considered**:
  1. Custom OAuth implementation — avoids dependency but reimplements PKCE, state, and session logic.
  2. Clerk — excellent DX but vendor lock-in and separate user management outside the app DB.
  3. Auth.js v5 + Google Provider — open-source, App Router native, zero credential storage.
- **Selected Approach**: Auth.js v5 with `GoogleProvider` + Mongoose adapter (or custom `signIn` callback for user upsert).
- **Rationale**: Explicit requirement. Eliminates password storage, phishing vectors, and credential rotation concerns entirely. Auth.js handles PKCE, state, and JWT/session lifecycle.
- **Trade-offs**: Users must have a Google account; no fallback credential login. Admin role must be assigned directly in MongoDB — no self-service admin registration.
- **Follow-up**: Verify Auth.js v5 Mongoose adapter availability; if not available, implement a custom `signIn` callback that upserts the User document and attaches `role` via the `jwt` callback.

### Decision: SSE for Real-Time Leaderboard Updates

- **Context**: Req 6.3 needs near-real-time standings refresh.
- **Alternatives Considered**:
  1. WebSockets (socket.io) — bi-directional, rich, but requires persistent connection and separate server.
  2. Polling — simple but wasteful; acceptable fallback.
  3. SSE via Route Handler — unidirectional push, no extra infra, supported natively in browsers.
- **Selected Approach**: SSE Route Handler.
- **Rationale**: Leaderboard updates are server-initiated and unidirectional; SSE is the minimal correct tool.
- **Trade-offs**: SSE connections are limited per browser origin (6 in HTTP/1.1); mitigated by HTTP/2 multiplexing.
- **Follow-up**: Implement SSE keepalive and reconnect logic in the client hook.

---

## Risks & Mitigations

- **Scoring recalculation race condition** — Two admins triggering recalculation simultaneously could produce inconsistent scores. Mitigation: optimistic lock on `Round.scoringStatus` field; second trigger blocked until first completes.
- **Leaderboard SSE fan-out at scale** — Many concurrent SSE connections on score update. Mitigation: debounce score-update events (100ms), consider moving to polling above 500 concurrent users.
- **Auth.js v5 + Next.js 16 compatibility** — Auth.js v5 may have breaking changes relative to training data. Mitigation: read `node_modules/next-auth/CHANGELOG.md` before implementation.
- **Mongoose serverless cold start** — Mongoose `connect()` must not be called on every request. Mitigation: module-level connection singleton in `lib/db.ts`; check `readyState` before connecting.
- **LOTECA data entry errors** — Results entered incorrectly by admin. Mitigation: confirmation prompt on publish (Req 2.6) and recalculation trigger (Req 4.8).

---

## References

- Next.js App Router documentation (check `node_modules/next/dist/docs/` per AGENTS.md instruction)
- Auth.js v5 — https://authjs.dev/
- Mongoose 8 — https://mongoosejs.com/docs/
- MongoDB Atlas — https://www.mongodb.com/docs/atlas/
- React 19 `useActionState` / `useOptimistic` — https://react.dev/
- Server-Sent Events — https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events
