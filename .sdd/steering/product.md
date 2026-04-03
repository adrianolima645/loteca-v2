# Product Overview

**Loteca Platform** is a social prediction game built on Brazil's LOTECA football lottery. Registered users submit predictions for official LOTECA rounds (14 matches each), earn weighted points, and compete within administrator-defined championships.

## Core Capabilities

- **Prediction submission**: Users pick Home / Draw / Away for each of 14 matches per open round, with upsert semantics (editable until round closes).
- **Configurable scoring engine**: Base 1 point per correct prediction, with per-league weight multipliers that apply on draws or always, configurable per championship.
- **Championship management**: Concurrent multi-period championships (e.g. monthly + annual), each with its own scoring rule set and round membership.
- **Live leaderboards**: Near-real-time standings via SSE push; current user's row highlighted in every leaderboard.
- **Immutable history**: Closed championships and past bet records are frozen and preserved indefinitely for audit.

## Target Use Cases

- **Player**: Discover open rounds → submit/update predictions → track standings → review past performance.
- **Admin**: Create rounds with matches → open/close betting windows → publish official results → manage championships and scoring rules.

## Value Proposition

Turns the passive LOTECA lottery into a competitive community experience — points, rankings, and championships give the weekly lottery ritual a persistent social layer without any real-money wagering.

## Non-Goals

- No real-money transactions or wallet features.
- No CEF/LOTECA API integration — results are entered manually by admins.
- No mobile native app (responsive web only).
- No social features beyond leaderboards (no chat, friend lists).

---
_Focus on patterns and purpose, not exhaustive feature lists_
