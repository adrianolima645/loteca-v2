# Project Structure

## Organization Philosophy

**Route-collocated pages, shared components by role.** App Router pages live under `src/app/` following URL hierarchy. Shared UI is split between `src/components/ui/` (primitive shadcn wrappers) and `src/components/` (domain-aware composites). Business logic lives in `src/lib/` services and repositories, not in page files.

## Directory Patterns

### App Pages
**Location**: `src/app/`  
**Purpose**: Next.js App Router page and layout files only — no business logic.  
**Pattern**: Each route segment is a folder; `page.tsx` is the entry; `layout.tsx` wraps children.

```
src/app/
├── page.tsx                  # Dashboard (/)
├── login/page.tsx            # Sign-in
├── bet/[round]/page.tsx      # Bet placement
├── championships/            # Championships list + detail
├── history/                  # Bet history list + round detail
├── profile/page.tsx          # User profile
└── admin/                    # Admin sub-app (own layout with sidebar)
    ├── layout.tsx
    ├── rounds/
    ├── championships/
    ├── results/
    └── scoring/
```

### Domain Components
**Location**: `src/components/`  
**Purpose**: Reusable, domain-aware composite components shared across pages.  
**Examples**: `Navbar`, `Leaderboard`, `RoundCard`, `MatchRow`, `StatsCard`, `NotificationsPanel`  
**Pattern**: Named exports, PascalCase, `"use client"` only when state/hooks needed.

### UI Primitives
**Location**: `src/components/ui/`  
**Purpose**: shadcn/ui primitives — no business logic, no data fetching.  
**Pattern**: Generated/maintained by shadcn CLI. Do not add domain logic here.

### Utilities & Hooks
**Location**: `src/lib/`, `src/hooks/`  
**Purpose**: Shared utilities (`cn`, `db`), custom hooks (`use-mobile`, `use-toast`).

> **Future**: As backend logic is added, domain services belong in `src/lib/services/` and repositories in `src/lib/repositories/`.

## Naming Conventions

- **Page files**: `page.tsx`, `layout.tsx` (Next.js convention)
- **Component files**: `kebab-case.tsx` (e.g. `match-row.tsx`, `round-card.tsx`)
- **Component exports**: PascalCase named export matching the concept (e.g. `export function MatchRow`)
- **Types/interfaces**: PascalCase inline in the same file unless shared
- **Hooks**: `use-kebab-case.ts`
- **Routes**: English, lowercase, kebab-case (e.g. `/bet/[round]`, `/admin/rounds/new`)

## Import Organization

```typescript
// 1. React / Next.js internals
import { useState } from "react"
import Link from "next/link"

// 2. Third-party libraries
import { Trophy } from "lucide-react"
import { toast } from "sonner"

// 3. Absolute project imports (@/)
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// 4. Relative imports (same module only)
import { localHelper } from "./helper"
```

**Path Aliases**:
- `@/` → `src/` (configured in `tsconfig.json` and `components.json`)

## Code Organization Principles

- Pages are thin: data fetching + layout composition only. Extract any reusable UI into `src/components/`.
- Client Components are opt-in: default to Server Components; add `"use client"` at the lowest possible boundary.
- Mock data lives inline in page files during the frontend phase; it will be replaced by Server Action calls when the backend is wired.
- Admin section is isolated under `src/app/admin/` with its own `layout.tsx` (sidebar navigation), separate from the user-facing `Navbar`.

---
_Document patterns, not file trees. New files following patterns shouldn't require updates_
