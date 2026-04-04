# Requirements Document

## Project Description (Input)
A bet platform based exclusively on LOTECA (Brazil's official football lottery). The platform allows multiple users to place bets on LOTECA matches, configures competitions with defined periods, scores users based on bet accuracy with weighted rules per league/match type, and provides dashboards for leaderboards and historical review of bets and championships.

---

## Introduction

The **Loteca Platform** is a social betting application focused exclusively on Brazil's LOTECA lottery. It enables users to submit predictions for official LOTECA rounds, accumulates points according to configurable scoring rules (including league-based weights), and organizes users into competitive championships per period. Administrators can configure rounds, scoring weights, and championship windows. All users can track live standings, review past championships, and audit their historical bet records.

---

## Requirements

### Requirement 1: User Authentication and Account Management

**Objective:** As a user, I want to register, log in, and manage my account, so that my bets and scores are tied to a persistent identity.

#### Acceptance Criteria
1. When a visitor submits a valid registration form with unique email and password, the Loteca Platform shall create a new user account and send a confirmation.
2. When a registered user submits correct credentials, the Loteca Platform shall authenticate the session and redirect to the dashboard.
3. If a login attempt is made with invalid credentials, the Loteca Platform shall display an error message and not grant access.
4. If a user submits a registration with an already-registered email, the Loteca Platform shall reject the request and notify the user.
5. The Loteca Platform shall support at minimum the roles: **User** (places bets, views standings) and **Admin** (configures rounds, championships, scoring rules).
6. While a user is authenticated, the Loteca Platform shall maintain session state across navigation without requiring re-login within the session lifetime.
7. The Loteca Platform shall persist the user's display theme preference (light / dark / system) and apply it on every page load without flash.

---

### Requirement 2: LOTECA Round Management

**Objective:** As an admin, I want to create and manage LOTECA rounds with their matches, so that users can place bets on official lottery results.

#### Acceptance Criteria
1. When an admin creates a new round, the Loteca Platform shall record the round number, opening date, closing date, and list of matches (home team, away team, competition/league).
2. When an admin assigns a league/competition to a match within a round, the Loteca Platform shall store the league identifier for use in scoring calculations.
3. The Loteca Platform shall support at minimum the following leagues: **Série A**, **Série B**, **Copa do Brasil**, **Estaduais**, and a generic "Other" category.
4. When an admin closes a round, the Loteca Platform shall prevent new bet submissions for that round.
5. When an admin publishes official results for a round, the Loteca Platform shall record the outcome (home win, draw, away win) for each match and trigger score recalculation.
6. If an admin attempts to publish results for a round that already has published results, the Loteca Platform shall prompt for confirmation before overwriting.

---

### Requirement 3: Bet Placement

**Objective:** As a user, I want to place my predictions for all matches in an open LOTECA round, so that I can compete for points in active championships.

#### Acceptance Criteria
1. While a round is open, the Loteca Platform shall allow authenticated users to submit exactly one prediction per match (home win / draw / away win).
2. When a user submits a complete bet for a round, the Loteca Platform shall persist the bet and display a confirmation.
3. While a round is open, the Loteca Platform shall allow a user to update their submitted predictions up until the round closes.
4. When a round closes, the Loteca Platform shall lock all bet submissions for that round so no further changes can be made.
5. If a user attempts to submit a bet for a closed round, the Loteca Platform shall reject the submission and display an appropriate message.
6. The Loteca Platform shall display to the user the current status of their bet (pending results, scored, or not submitted) for each round.

---

### Requirement 4: Scoring Engine

**Objective:** As a platform operator, I want a configurable scoring engine that awards points per correct prediction with league-based weight modifiers, so that competitions reflect the importance of different matches.

#### Acceptance Criteria
1. When official results are published for a round, the Loteca Platform shall calculate each user's score for that round based on the number of correct predictions.
2. The Loteca Platform shall award a base score of **1 point** for each correctly predicted match result.
3. Where a match belongs to **Série A**, the Loteca Platform shall apply a configurable weight multiplier to the base point for a correct prediction on that match.
4. Where a match belongs to **Série B**, the Loteca Platform shall apply a configurable weight multiplier (lower than Série A) to the base point.
5. Where a match belongs to any configured league, the Loteca Platform shall allow admins to define a specific weight multiplier per league independent of other leagues.
6. The Loteca Platform shall apply the weight multiplier **only when the match result is a draw**, as specified in the competition's scoring configuration.
7. When a user's round score is calculated, the Loteca Platform shall store both the raw correct-count and the weighted total for audit purposes.
8. If scoring weights are updated after results are published, the Loteca Platform shall allow admins to trigger a re-calculation for the affected round.

---

### Requirement 5: Championship Configuration

**Objective:** As an admin, I want to create championships that span defined periods and include specific rounds, so that users compete within organized seasonal competitions.

#### Acceptance Criteria
1. When an admin creates a championship, the Loteca Platform shall record the championship name, start date, end date, and the set of LOTECA rounds included.
2. The Loteca Platform shall allow multiple championships to be active simultaneously (e.g., a monthly and a yearly championship running in parallel).
3. When a LOTECA round is completed and results scored, the Loteca Platform shall automatically include those round scores in all active championships that contain the round.
4. The Loteca Platform shall allow admins to add or remove rounds from a championship while the championship is still active.
5. When a championship's end date is reached, the Loteca Platform shall mark the championship as closed and freeze the final standings.
6. If an admin attempts to delete a championship that has user score history, the Loteca Platform shall require explicit confirmation before deletion.

---

### Requirement 6: Leaderboard and Dashboard

**Objective:** As a user, I want a dashboard showing current championship standings and my personal score history, so that I can track my performance and compare with other participants.

#### Acceptance Criteria
1. The Loteca Platform shall display a leaderboard for each active championship showing user rank, username, total points, number of rounds played, and number of correct predictions.
2. When a user views their personal dashboard, the Loteca Platform shall show their current rank and point total for each active championship they have participated in.
3. When round scores are updated, the Loteca Platform shall reflect the updated standings in the leaderboard without requiring a manual page refresh (real-time or near-real-time update).
4. The Loteca Platform shall visually highlight the authenticated user's own row in any leaderboard they view.
5. While a championship is active, the Loteca Platform shall display the remaining rounds in the championship period.
6. The Loteca Platform shall display the points breakdown per round for each user on request (drill-down from leaderboard to round-level detail).

---

### Requirement 7: Historical Review — Bets

**Objective:** As a user, I want to review all my past bets and their outcomes, so that I can analyze my prediction history and accuracy.

#### Acceptance Criteria
1. When a user navigates to their bet history, the Loteca Platform shall list all rounds in which the user submitted a bet, ordered by most recent first.
2. When a user selects a past round, the Loteca Platform shall display each match, the user's prediction, the official result, and whether the prediction was correct.
3. The Loteca Platform shall display per-round statistics: total predictions, correct predictions, and points earned (weighted).
4. The Loteca Platform shall allow users to filter bet history by championship, date range, or round number.
5. If a user has not submitted a bet for a past round, the Loteca Platform shall indicate the round as "not participated" in the history view.

---

### Requirement 8: Historical Review — Championships

**Objective:** As a user, I want to browse completed championships and their final standings, so that I can reference past results and competitive history.

#### Acceptance Criteria
1. The Loteca Platform shall provide a list of all past (closed) championships with their name, period, and winner.
2. When a user selects a past championship, the Loteca Platform shall display the final leaderboard with all participants, their total points, and their rank at the time of closing.
3. The Loteca Platform shall allow users to inspect any participant's round-by-round score breakdown within a past championship.
4. The Loteca Platform shall preserve historical championship data indefinitely and not alter it after the championship is closed.
5. The Loteca Platform shall allow filtering of the past championships list by date range or championship name.

---

### Requirement 9: Scoring Rule Configuration

**Objective:** As an admin, I want to define and adjust scoring rules per competition and championship, so that the platform can adapt to different competition formats without code changes.

#### Acceptance Criteria
1. The Loteca Platform shall provide an admin interface to define scoring rules consisting of: base points per correct prediction, league-specific weight multipliers, and conditions under which multipliers apply (e.g., draw-only or always).
2. When an admin saves a new scoring rule set, the Loteca Platform shall associate it with a specific championship so different championships can have different rules.
3. The Loteca Platform shall display the active scoring rules to all users on the championship detail page for transparency.
4. If no custom scoring rule is defined for a championship, the Loteca Platform shall apply the system-default scoring rule (1 point per correct prediction, no multipliers).
5. When scoring rules are updated for an active championship, the Loteca Platform shall recalculate all existing scores in that championship using the new rules and update standings accordingly.

---

### Requirement 10: Notifications and Round Status

**Objective:** As a user, I want to receive timely notifications about round openings, closings, and result publications, so that I never miss an opportunity to place or review bets.

#### Acceptance Criteria
1. When a new LOTECA round is opened by an admin, the Loteca Platform shall notify all registered users that a new round is available for betting.
2. When a round is approaching its closing deadline (configurable threshold, e.g., 24 hours), the Loteca Platform shall send a reminder notification to users who have not yet submitted a bet.
3. When official results are published for a round, the Loteca Platform shall notify all users who participated in that round with their score summary.
4. The Loteca Platform shall support at minimum in-platform (UI) notifications; email notifications are optional and configurable per user preference.
5. If a user disables email notifications in their account settings, the Loteca Platform shall suppress email sends for that user while preserving in-platform notifications.

---

### Requirement 11: Display Theme Preference

**Objective:** As a user, I want to toggle between light and dark mode, so that I can use the platform comfortably in different lighting conditions.

#### Acceptance Criteria
1. The Loteca Platform shall provide a theme toggle control (light / dark / system) accessible from the navigation bar on every page.
2. When a user selects a theme, the Loteca Platform shall apply it immediately without a full page reload.
3. The selected theme shall be persisted in `localStorage` so that it is restored on the next visit without a flash of unstyled content (FOUC).
4. When the theme is set to **system**, the Loteca Platform shall follow the OS-level `prefers-color-scheme` preference and update automatically if the OS preference changes.
5. The theme toggle shall be operable by keyboard and meet WCAG 2.1 AA contrast requirements in both light and dark modes.
