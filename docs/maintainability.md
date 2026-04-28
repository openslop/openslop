# Maintainability Guide

This document captures high-signal architectural boundaries and refactor rules for OpenSlop contributors.

## Non-negotiable invariants

- `proxy.ts` is intentional (Next.js 16 migration target). Do **not** rename it.
- Third-party tracking pixels/scripts remain in `<head>` unless explicitly directed otherwise.
- Keep behavior unchanged when doing cleanup/refactor-only work.

## Architectural boundaries

### 1) UI surfaces (`app/`, `components/ui/`)

- `app/components/**` contains feature-facing UI and editor interactions.
- `components/ui/**` holds design-system primitives.
- Prefer extracting reusable leaf components over adding mode booleans to large components.

### 2) Domain + orchestration (`lib/`)

- `lib/connectors/**`: media-type connector abstraction and plugins.
- `lib/generation/**`: queue + job lifecycle orchestration.
- `lib/providers/**`: provider-specific adapters.
- `lib/api/**`: route handler helpers and response/logging utilities.

Rule of thumb: keep provider details out of UI components; UI should talk to connector/domain interfaces.

### 3) Platform integration

- `lib/supabase/**` handles auth/session/db helpers.
- `app/api/**` route handlers should remain thin and delegate logic to `lib/**`.

## Refactor heuristics

Use this ordering for low-risk maintainability improvements:

1. **Best-practice fixes (objective):** unsafe patterns, duplicated branch logic, stale abstractions.
2. **Structural simplification:** extract shared helpers/components to reduce duplication.
3. **Dead-code removal:** remove unreachable paths only when certainty is high.
4. **Docs updates:** capture the “why” behind boundaries and invariants.

## PR quality bar for maintainability changes

A maintainability PR should include:

- Clear scope statement (what changed / what intentionally did not).
- Net simplification evidence (fewer branches, fewer duplicate blocks, or clearer module boundaries).
- Validation outputs:
  - `npm run build`
  - `npm test -- --passWithNoTests`

## Common pitfalls to avoid

- Mixing provider-specific formatting/parsing into editor UI.
- Growing boolean-heavy component APIs instead of composing smaller components.
- Broad “cleanup” churn that renames/moves files without readability or ownership gains.
- Untracked architectural changes without docs updates.
