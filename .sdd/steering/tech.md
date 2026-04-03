# Technology Stack

## Architecture

Feature-module layered architecture on Next.js 16 App Router. Three bounded contexts: **Round & Betting**, **Scoring & Championship**, **Notifications**. Server Actions are the exclusive mutation layer; Route Handlers are reserved for SSE streams.

## Core Technologies

- **Language**: TypeScript 5 (strict mode, `ignoreBuildErrors: true` only during scaffolding phase)
- **Framework**: Next.js 16 (App Router, React 19, Server Components + Server Actions)
- **Styling**: Tailwind CSS 4 with `tw-animate-css`; design tokens via CSS custom properties in `globals.css`
- **UI primitives**: shadcn/ui (New York style, `cssVariables: true`, icon library: lucide-react)
- **Auth**: Auth.js v5 — Google OAuth 2.0 only; no password storage
- **ODM**: Mongoose 8 with connection caching for serverless (`lib/db.ts` singleton pattern)
- **Database**: MongoDB 7 (Atlas)
- **Real-time**: SSE via Next.js Route Handler + native `EventSource` client (pull-on-push pattern)
- **Forms**: react-hook-form + zod for Server Action input validation
- **Notifications (UI)**: sonner for toasts; in-platform notification collection in DB

## Key Libraries

| Library | Role |
|---------|------|
| `next-themes` | Dark/light mode via `ThemeProvider`, defaults to `dark` |
| `date-fns` | Date arithmetic (round deadlines, championship periods) |
| `recharts` | Charts in leaderboard/history views |
| `sonner` | Toast notifications |
| `zod` | Runtime validation of Server Action inputs |
| `class-variance-authority` + `clsx` + `tailwind-merge` | Component variant composition via `cn()` helper |

## Design System

Brand tokens are defined in `src/app/globals.css` as CSS custom properties (both `:root` light and `.dark`):

- `--primary` / `--brand` — Loteca green (`oklch ~0.54–0.60 chroma 145°`)
- `--accent` / `--gold` — warm amber for scoring highlights
- `--correct` — green (correct prediction indicator)
- `--incorrect` — red (incorrect prediction indicator)
- `--brand-muted` — low-opacity green for backgrounds

Tokens are exposed to Tailwind via `@theme inline`, enabling utilities like `bg-brand`, `text-gold`, `bg-correct`.

## Development Standards

### Type Safety
- TypeScript strict mode. Avoid `any`; use discriminated unions for domain errors (`Result<T, E>`).
- Domain error codes are string literal unions, not thrown exceptions.

### Server/Client boundary
- Pages are Server Components by default; add `"use client"` only when hooks or browser APIs are needed.
- All mutations go through Server Actions (never direct DB calls from Client Components).
- `userId` is always read from the server-side session, never from the request body.

### Input Validation
- All Server Action inputs validated with `zod` schemas before reaching the service layer.

### Testing
- **Unit tests**: Jest + `@testing-library/react` for services, utilities, and component logic.
- Test files colocated with source: `foo.test.ts` / `foo.test.tsx` next to the file under test.
- Focus unit tests on pure domain logic: `ScoreCalculationService`, `RoundService` state machine, `BetService` validation. UI components tested for interaction behaviour, not snapshot diffing.

### Code Quality
- ESLint (`eslint-config-next`)
- `cn()` utility from `@/lib/utils` for all conditional class composition

## Development Environment

### Common Commands
```bash
npm run dev    # Development server
npm run build  # Production build
npm run lint   # ESLint
npm test       # Jest unit tests
npm run test:watch  # Jest in watch mode
```

## Key Technical Decisions

- **Server Actions over REST**: eliminates a separate API layer for mutations; route handlers only for SSE.
- **MongoDB embedding**: `Match[]` embedded in `Round`, `BetSelection[]` embedded in `BetSlip` — always queried together, small cardinality.
- **Materialized `ChampionshipStanding`**: pre-aggregated on score calculation, avoiding full-scan aggregation on every leaderboard load.
- **Google OAuth only**: removes credential storage and password flows entirely.
- **Dark mode default**: `ThemeProvider defaultTheme="dark"` — brand green is designed for dark surfaces.

---
_Document standards and patterns, not every dependency_
