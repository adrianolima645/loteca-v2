# Code Review Standards

Best practice rules for reviewing code in this stack. Use these as the checklist when reviewing PRs or running an agent-assisted review.

---

## 1. Server / Client Component Boundary

**Rule**: Default to Server Components. Add `"use client"` at the lowest possible boundary.

```tsx
// ✅ Server Component — no directive, no useState
export default async function ChampionshipsPage() {
  const championships = await getChampionships() // server-side fetch
  return <ChampionshipList items={championships} />
}

// ✅ Client island — only the interactive piece opts in
"use client"
export function ChampionshipList({ items }: Props) {
  const [selected, setSelected] = useState(items[0].id)
  ...
}
```

**Review flags**:
- `"use client"` on a page or layout file — almost always wrong; extract the interactive part.
- `useState` / `useEffect` in a file without `"use client"` — will fail at runtime.
- Data fetching inside a Client Component using `useEffect` — move to Server Component or Server Action.

---

## 2. Server Actions Security

Every Server Action must re-validate role and ownership server-side. Never trust data from the request body for identity or authorization.

```tsx
// ✅ Correct
async function submitBetAction(input: SubmitBetInput) {
  const session = await getServerSession()
  if (!session) throw new Error("Unauthenticated")
  // userId always from session, never from input
  await betService.upsertBetSlip(session.user.id, input.roundId, input.selections)
}

// ❌ Wrong — userId from client input
async function submitBetAction(userId: string, input: SubmitBetInput) { ... }
```

**Review flags**:
- `userId`, `role`, or any identity claim read from the action's arguments rather than `getServerSession()`.
- Admin-only actions missing a `session.user.role === 'ADMIN'` guard.
- Missing `zod` validation before reaching service layer — all action inputs must be parsed with a schema.
- `revalidatePath` / `redirect` called before all error checks — do side-effects last.

---

## 3. TypeScript & Type Safety

**Rule**: No `any`. Use discriminated unions for domain results and errors.

```tsx
// ✅ Domain result pattern
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E }

type BetError =
  | { code: "ROUND_NOT_OPEN" }
  | { code: "INCOMPLETE_SELECTIONS"; expected: number; received: number }

// ✅ Narrowing at the call site
const result = await betService.upsertBetSlip(...)
if (!result.ok) {
  if (result.error.code === "INCOMPLETE_SELECTIONS") { ... }
  return
}
// result.value is typed here
```

**Review flags**:
- `as any`, `as unknown as X` casts without a comment justifying them.
- `interface` props with optional fields that are always required in practice — prefer required fields.
- Inline `type` redefinitions that duplicate types already defined in domain interfaces.
- Enums used where string literal unions suffice — prefer `'DRAFT' | 'OPEN' | 'CLOSED'`.

---

## 4. Tailwind & Design System

**Rule**: Use design tokens (`bg-primary`, `text-muted-foreground`, `bg-brand`, `text-gold`) rather than raw colour values. Use `cn()` for conditional class composition.

```tsx
// ✅ Token-based
<Badge className="bg-primary/20 text-primary">Série A</Badge>

// ❌ Hardcoded colour — breaks dark mode and token updates
<Badge className="bg-green-500/20 text-green-400">Série A</Badge>

// ✅ Conditional classes
<div className={cn("rounded-lg border", isActive && "border-primary bg-brand-muted")}>
```

**Review flags**:
- Raw hex values or unnamed Tailwind colour scales (`green-500`, `blue-400`) used where a semantic token exists.
- Conditional class strings built with template literals instead of `cn()`.
- `style={{ }}` inline styles for anything expressible in Tailwind.
- Responsive classes missing for components that render on mobile (check `sm:`, `md:` prefixes on layout-critical props).

---

## 5. Mongoose / MongoDB Patterns

**Rule**: Use lean queries for read-only data. Always specify only the fields you need. Never expose raw Mongoose documents to the client.

```ts
// ✅ Lean, projected read
const standing = await ChampionshipStandingModel
  .findOne({ championshipId, userId })
  .select("totalPoints rank roundsPlayed")
  .lean<ChampionshipStanding>()

// ❌ Full document fetch for a display-only value
const standing = await ChampionshipStandingModel.findOne({ championshipId, userId })
```

**Review flags**:
- `.find()` without `.lean()` on queries that only produce display data.
- Missing compound index for query patterns (every `{ a: 1, b: 1 }` query needs a matching index defined in the schema file).
- `findOne` followed by a mutation on the JS object instead of `findOneAndUpdate` — not atomic.
- Mongoose connection opened without checking `mongoose.connection.readyState` — always use the `lib/db.ts` singleton.
- Sensitive fields (passwords, tokens) selected by default — use `select: false` in the schema definition.

---

## 6. Auth.js v5 Integration

**Review flags**:
- `session.user.role` used in a Client Component to gate UI without a matching server-side check — client gating is cosmetic only; the Server Action must also guard.
- Custom OAuth flow implemented instead of using the Auth.js `GoogleProvider` — never bypass the library's PKCE/state handling.
- JWT `encode`/`decode` overridden without preserving the `role` and `userId` claims added in the `jwt` callback.
- Middleware (`middleware.ts`) matching too broadly (e.g. `/api/**`) and blocking SSE route handler connections.

---

## 7. Jest / Testing Library

**Rule**: Test behaviour, not implementation. One logical assertion group per test. Mock at the module boundary, not inside the function under test.

```ts
// ✅ Behaviour-focused unit test
it("returns ROUND_NOT_OPEN when round is closed", async () => {
  const round = buildRound({ status: "CLOSED" })
  jest.spyOn(roundRepo, "findById").mockResolvedValue(round)

  const result = await betService.upsertBetSlip("user-1", round.id, mockSelections)

  expect(result.ok).toBe(false)
  expect(result.error.code).toBe("ROUND_NOT_OPEN")
})

// ❌ Implementation-focused — tests Mongoose internals
it("calls findOneAndReplace with upsert: true", async () => { ... })
```

**Review flags**:
- Tests that `expect(fn).toHaveBeenCalledWith(...)` as the primary assertion — verify outcomes, not calls.
- No test for the error/failure path — every `Result<T, E>` service method needs both `ok: true` and `ok: false` cases tested.
- `describe` blocks with more than ~10 `it` cases — split by scenario or method.
- `@testing-library/react` tests querying by `className` or DOM structure instead of accessible roles/labels.
- Mocking `mongoose` at the global level — mock the repository interface instead.

---

## Quick Reference Checklist

| Area | Key question |
|------|-------------|
| Server/Client boundary | Is `"use client"` at the lowest possible boundary? |
| Server Action security | Is `userId`/`role` from session, not arguments? Is input zod-validated? |
| Type safety | Any `any` casts? Are error paths typed as discriminated unions? |
| Tailwind | Using design tokens? `cn()` for conditionals? |
| Mongoose | `.lean()` on reads? Matching index for every query? DB singleton used? |
| Auth | Server-side guard mirrors client-side gate? No custom OAuth flow? |
| Tests | Testing behaviour? Both happy path and error path covered? |

---
_Review for patterns and correctness, not style preferences already enforced by ESLint_
