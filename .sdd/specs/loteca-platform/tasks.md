# Implementation Plan

## loteca-platform

---

- [ ] 1. Project foundation and database setup
- [x] 1.1 Configure MongoDB connection singleton and Mongoose base setup
  - Create `lib/db.ts` with `mongoose.connect` guarded by `readyState` check for serverless caching
  - Define shared base schema options (timestamps, toJSON transform)
  - Add `MONGODB_URI` env var to `.env.local.example`
  - _Requirements: 1.1_

- [x] 1.2 Define User schema and repository
  - Schema fields: `googleId` (unique), `email` (unique), `name`, `image`, `role` enum (`USER`/`ADMIN`), `emailNotificationsEnabled`
  - Unique indexes on `googleId` and `email`
  - Repository method: upsert by `googleId`, find by id, find by email
  - _Requirements: 1.1, 1.4, 1.5_

- [ ] 1.3 (P) Define Round and Match schema
  - `Round` schema: `roundNumber` (unique), `status` enum, `openAt`, `closeAt`, `scoringStatus`, embedded `Match[]` array
  - `Match` embedded fields: `homeTeam`, `awayTeam`, `league` enum, `outcome` (nullable), `position`
  - Indexes: unique `roundNumber`, compound `status + closeAt` for deadline queries
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 1.4 (P) Define BetSlip schema and repository
  - Schema: `userId`, `roundId`, embedded `BetSelection[]` (matchId + prediction), `submittedAt`, `status` enum
  - Unique compound index on `(userId, roundId)`, secondary index on `roundId`
  - Repository: upsert by `(userId, roundId)`, find by user, find by round
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 1.5 (P) Define Scoring, Championship, and Standing schemas
  - `ScoringRuleSet`: `championshipId` (nullable for system default), `basePoints`, `leagueWeights[]`, `applyWeightOn`
  - `UserRoundScore`: unique compound `(userId, roundId, championshipId)`, `rawCorrectCount`, `weightedPoints`
  - `Championship`: `name`, `startDate`, `endDate`, `status`, `roundIds[]`, `scoringRuleSetId`
  - `ChampionshipStanding`: compound unique `(championshipId, userId)`, `totalPoints`, `roundsPlayed`, `correctPredictions`, `rank`, `frozen` flag
  - Indexes per design.md Physical Data Model section
  - _Requirements: 4.7, 5.1, 5.5, 9.1_

- [ ] 1.6 (P) Define Notification schema and repository
  - Schema: `userId`, `type` enum, `payload` (JSON string), `read`, `createdAt`
  - Index on `(userId, read)` for unread fetch
  - Repository: insert many, find unread by user, mark read
  - _Requirements: 10.1, 10.4_

---

- [ ] 2. Authentication
- [ ] 2.1 Configure Auth.js v5 with Google provider
  - Install and configure `next-auth` with `GoogleProvider` using `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
  - Set up Mongoose adapter or manual user upsert in `signIn` callback
  - Extend JWT and session callbacks to embed `userId` and `role` from DB
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 2.2 Implement role-based middleware
  - `middleware.ts` guards `/admin/**` routes — redirect to `/login` if no session or role !== `ADMIN`
  - Guard all authenticated routes — redirect unauthenticated users from `/`, `/bet/**`, `/history`, `/profile`, `/championships` to `/login`
  - _Requirements: 1.5, 1.6_

- [ ] 2.3 Wire auth to login and sign-out UI
  - Connect login page `Sign in with Google` button to Auth.js `signIn("google")`
  - Connect navbar Sign Out to Auth.js `signOut()`
  - Replace hardcoded user name/avatar in `Navbar` with session data
  - _Requirements: 1.2, 1.3, 1.6_

- [ ] 2.4 Add dark / light / system theme toggle to navbar
  - Add a `ThemeToggle` client component (icon button cycling light → dark → system) using `next-themes` `setTheme`
  - Mount it in `Navbar` alongside the existing nav items
  - Verify `ThemeProvider` has `storageKey`, `enableSystem`, and `disableTransitionOnChange` set so there is no FOUC
  - _Requirements: 1.7, 11.1, 11.2, 11.3, 11.4, 11.5_

---

- [ ] 3. Round lifecycle management
- [ ] 3.1 Implement RoundService core state machine
  - Methods: `createRound`, `openRound`, `closeRound` — enforce `DRAFT→OPEN→CLOSED` transitions
  - Return `Result<Round, RoundError>` with `INVALID_TRANSITION` on illegal state change
  - Auto-close background check: cron/polling job queries `status=OPEN AND closeAt < now` and transitions to `CLOSED`
  - _Requirements: 2.1, 2.4_

- [ ] 3.2 Implement result publication
  - `publishResults` method saves `MatchOutcome` per match, transitions round to `RESULTS_PUBLISHED`
  - Guard: if already `RESULTS_PUBLISHED`, return `RESULTS_ALREADY_PUBLISHED` error (UI confirms before retry)
  - After save, trigger `ScoreCalculationService.calculateScores(roundId)` asynchronously
  - _Requirements: 2.5, 2.6_

- [ ] 3.3 Wire admin rounds Server Actions
  - Server Actions: `createRoundAction`, `openRoundAction`, `closeRoundAction`, `publishResultsAction`
  - Each action: authenticate session, assert `ADMIN` role, validate input with zod, call service, `revalidatePath`
  - Wire to admin rounds list page and round creation form
  - _Requirements: 2.1, 2.4, 2.5, 2.6_

---

- [ ] 4. Bet placement
- [ ] 4.1 Implement BetService
  - `upsertBetSlip`: verify round `status === OPEN`, validate exactly 14 selections, atomically replace full `BetSlip` document
  - `getBetSlip`: fetch current slip for `(userId, roundId)` for pre-filling the form
  - Return typed `BetError` codes: `ROUND_NOT_OPEN`, `INCOMPLETE_SELECTIONS`, `ROUND_NOT_FOUND`
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 4.2 Implement bet submission Server Action and wire to bet form
  - `submitBetAction`: read `userId` from session only, parse input with zod, call `BetService.upsertBetSlip`
  - Pre-populate form with existing `BetSlip` if user has already submitted
  - Use `useOptimistic` to show instant confirmation before action resolves
  - Display round status badge and lock form UI when round is `CLOSED`
  - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6_

- [ ] 4.3 (P) Display bet status on dashboard round cards
  - Fetch current `BetSlip` status for the authenticated user for each open round
  - Map to `not_submitted`, `submitted`, `scored` badge on `RoundCard`
  - Replace mock data in `page.tsx` open rounds section with server-fetched data
  - _Requirements: 3.6_

---

- [ ] 5. Scoring engine
- [ ] 5.1 Implement ScoringRuleService
  - CRUD for `ScoringRuleSet`: create, update, list, `getRuleSetForChampionship` (falls back to system default when `championshipId` is null)
  - Validate `multiplier > 0` on save; reject with `INVALID_MULTIPLIER` error
  - Admin Server Actions: create, update rule sets; wire to admin scoring page form
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [ ] 5.2 Implement ScoreCalculationService
  - For each `BetSlip` in the round, compare predictions to `MatchOutcome`; apply `basePoints × (weightCondition check ? leagueMultiplier : 1)` per correct prediction
  - Store both `rawCorrectCount` and `weightedPoints` in `UserRoundScore`
  - Upsert `ChampionshipStanding` aggregates for all championships containing the round
  - Use optimistic lock via `Round.scoringStatus` (`IN_PROGRESS` / `COMPLETE`) to prevent duplicate concurrent runs
  - Process BetSlips in batches of 500 to cap memory usage
  - After completion emit `ScoresUpdated { championshipIds, roundId, timestamp }` event
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

- [ ] 5.3 Implement recalculation on rule update
  - When `ScoringRuleService.updateRuleSet` is called for an active championship, trigger `recalculateScores(roundId, championshipId)` for all rounds in that championship
  - Admin-only Server Action: `recalculateRoundAction` for manual retrigger from results page
  - _Requirements: 4.8, 9.5_

---

- [ ] 6. Championship management
- [ ] 6.1 Implement ChampionshipService
  - CRUD: `createChampionship`, `addRound`, `removeRound`, `closeChampionship`, `deleteChampionship` (requires `force: true` when score history exists)
  - `closeChampionship` sets `frozen = true` on all `ChampionshipStanding` rows for that championship
  - Multiple concurrent championships supported by design — no single-active constraint
  - _Requirements: 5.1, 5.2, 5.4, 5.5, 5.6_

- [ ] 6.2 Auto-include round scores in active championships
  - After `ScoreCalculationService` completes, for each affected championship that contains the round, verify `ChampionshipStanding` totals are updated
  - This is satisfied by the upsert logic in task 5.2; verify coverage in integration test
  - _Requirements: 5.3_

- [ ] 6.3 Wire admin championship Server Actions
  - Server Actions: `createChampionshipAction`, `addRoundAction`, `removeRoundAction`, `closeChampionshipAction`, `deleteChampionshipAction`
  - Delete action: return `HAS_SCORE_HISTORY` if `force=false`; UI shows confirmation dialog before retrying with `force=true`
  - Wire to admin championships list and new championship form
  - _Requirements: 5.1, 5.4, 5.5, 5.6_

---

- [ ] 7. Leaderboard and real-time updates
- [ ] 7.1 Implement LeaderboardService query methods
  - `getStandings(championshipId)`: read from materialized `ChampionshipStanding` collection, sorted by rank
  - `getPersonalStats(userId, championshipId)`: user's rank, total points, accuracy for the championship
  - `getRoundBreakdown(userId, championshipId)`: per-round `rawCorrectCount` and `weightedPoints`
  - `listActiveChampionships()` and `listPastChampionships(filter)` for dashboard and history pages
  - _Requirements: 6.1, 6.2, 6.5, 6.6_

- [ ] 7.2 Implement in-memory EventBus and SSE route handler
  - Lightweight in-process `EventBus` (Map of listeners keyed by `championshipId`)
  - SSE Route Handler at `GET /api/leaderboard/[championshipId]/stream`: stream `ScoresUpdated` events as `text/event-stream`
  - Send keepalive comment every 30s; clean up listener on client disconnect
  - Client receives event → re-fetches standings via `LeaderboardService`
  - _Requirements: 6.3_

- [ ] 7.3 Wire leaderboard dashboard
  - Replace mock leaderboard data in `page.tsx` with server-fetched `ChampionshipStanding` rows
  - Highlight current user's row using `session.user.id` comparison
  - Connect `LeaderboardWidget` SSE client — on `ScoresUpdated` event, refetch and update standings
  - Show remaining rounds count from championship `roundIds` vs current date
  - _Requirements: 6.1, 6.2, 6.4, 6.5_

---

- [ ] 8. Bet history
- [ ] 8.1 Implement BetHistoryService
  - `getBetHistory(userId, filter)`: list all `BetSlip` records for user, join with `Round` data and `UserRoundScore`
  - Filters: `championshipId`, `fromDate`, `toDate`, `roundNumber` — apply as MongoDB query conditions
  - For rounds where user has no `BetSlip`, include round in list with `NOT_PARTICIPATED` status
  - _Requirements: 7.1, 7.4, 7.5_

- [ ] 8.2 Wire bet history pages
  - History list page (`/history`): replace mock data with `BetHistoryService` results; implement filter bar Server Action
  - Round detail page (`/history/[round]`): show per-match prediction, official result, correct/incorrect indicator, points earned
  - Per-round stats: total predictions, correct count, weighted points from `UserRoundScore`
  - _Requirements: 7.1, 7.2, 7.3_

---

- [ ] 9. Championship history
- [ ] 9.1 Implement ChampionshipHistoryService
  - `listPastChampionships(filter)`: query closed championships, support filter by date range and name
  - `getPastChampionshipDetail(championshipId)`: return frozen `ChampionshipStanding` rows (never recalculated after `frozen=true`)
  - `getParticipantRoundBreakdown(userId, championshipId)`: per-round scores for any participant within a past championship
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 9.2 Wire championship history pages
  - Past championships list (`/championships`): replace mock data with `ChampionshipHistoryService` results; filter by date range / name
  - Championship detail (`/championships/[id]`): frozen final leaderboard, trophy on rank 1, "You finished #N" callout for current user
  - Expandable per-participant round breakdown panel
  - _Requirements: 8.1, 8.2, 8.3, 8.5_

---

- [ ] 10. Notifications
- [ ] 10.1 Implement NotificationService
  - `notifyRoundOpened(roundId)`: bulk-insert `Notification` rows for all users; fetch email-opted-in users and call `EmailProvider.sendBatch`
  - `notifyRoundClosingSoon(roundId)`: notify only users who have NOT submitted a bet for the round
  - `notifyResultsPublished(roundId)`: notify users who participated, include their score summary in payload
  - Batch DB inserts in groups of 100; email failures logged but do not roll back in-platform notifications
  - _Requirements: 10.1, 10.2, 10.3, 10.5_

- [ ] 10.2 (P) Implement EmailProvider and user notification preferences
  - Define `EmailProvider` interface; implement concrete adapter (Resend or Nodemailer) injected at startup via env var
  - User settings Server Action: toggle `emailNotificationsEnabled`; wire to profile page settings section
  - `NotificationService` checks preference before adding user to email batch
  - _Requirements: 10.4, 10.5_

- [ ] 10.3 Wire notifications panel
  - `getUserNotifications(userId)`: fetch unread + recent read notifications, sorted by `createdAt` desc
  - `markReadAction` Server Action: mark single or all notifications read, `revalidatePath`
  - Replace mock data in `NotificationsPanel` component with live data; show unread badge count in `Navbar`
  - _Requirements: 10.4_

---

- [ ] 11. Scoring rules admin UI
- [ ] 11.1 Wire admin scoring page
  - Fetch system default `ScoringRuleSet` and all championship-scoped rule sets on page load
  - Form submission calls `createRuleSetAction` / `updateRuleSetAction` Server Actions
  - On save for active championship: display warning toast "Saving will trigger score recalculation"
  - Display active rules on championship detail page for user transparency
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

---

- [ ] 12. Integration testing
- [ ] 12.1 (P) Bet-to-score pipeline integration test
  - Use `mongodb-memory-server` to run full pipeline: open round → submit bets → publish results → verify `UserRoundScore` and `ChampionshipStanding`
  - Verify weighted scoring formula: draw-only vs always-correct multiplier paths
  - Verify `ROUND_NOT_OPEN` rejection after round closes
  - _Requirements: 3.4, 3.5, 4.1, 4.2, 4.6_

- [ ] 12.2 (P) Championship aggregation and recalculation integration test
  - Multiple rounds scored → verify `ChampionshipStanding` totals accumulate correctly
  - Rule update → trigger recalculation → verify standings change
  - Championship close → verify `frozen=true` on standings, no further updates
  - _Requirements: 4.8, 5.3, 5.5, 9.5_

- [ ] 12.3 (P) Notification fan-out integration test
  - Round open → verify `Notification` row created per user
  - User with `emailNotificationsEnabled=false` → verify no email dispatched, in-platform notification present
  - _Requirements: 10.1, 10.5_

---

- [ ] 13. E2E and performance tests
- [ ] 13.1* Full user journey E2E
  - Google OAuth sign-in → first-time user created → submit bet for open round → view confirmation
  - Admin creates round → adds matches → publishes results → leaderboard updates via SSE
  - _Requirements: 1.1, 1.2, 2.1, 2.5, 3.2, 6.3_

- [ ] 13.2* Score calculation performance baseline
  - 1,000 users × 14-match round → target `calculateScores` < 2s
  - Leaderboard standings query for 500 participants → target < 200ms
  - Concurrent bet submissions on round-close boundary → no duplicate `BetSlip` rows
  - _Requirements: 4.1, 6.1_
