## Summary

<!-- What does this PR do? One paragraph max. -->

## Changes

<!-- Bullet list of the main changes. Link tasks from .sdd/specs/ if applicable. -->

- 

## Spec tasks covered

<!-- e.g. loteca-platform 1.2, 1.3 -->

## Test coverage

- [ ] Unit tests added / updated
- [ ] Integration tests added / updated (mongodb-memory-server)
- [ ] All existing tests pass locally (`npm test`)

## Review checklist (self-review before requesting)

- [ ] `"use client"` only at the lowest necessary boundary
- [ ] Server Actions: `userId`/`role` from session, inputs validated with zod
- [ ] No raw colour classes — design tokens used (`bg-primary`, `bg-brand`, etc.)
- [ ] `.lean()` on read-only Mongoose queries
- [ ] No `any` casts without a comment explaining why

## Screenshots / recordings

<!-- For UI changes, add a screenshot or a short screen recording. Delete if not applicable. -->
