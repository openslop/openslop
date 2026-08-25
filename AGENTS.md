# Coding conventions

Follow @CONVENTIONS.md, the canonical coding style for this repo.

## Workflow

- After each change, run the checks from `.github/workflows/ci.yml` (lint, format, typecheck, tests) and fix all failures.
- After each round of code changes, run the following to review against best practices:
  - `/simplify`
  - `/vercel-composition-patterns`
  - `/web-design-guidelines`
  - `/vercel-react-best-practices`
  - Check against @CONVENTIONS.md

## Project structure

- Use the `@/*` path alias for imports that traverse 2+ directory levels (e.g. `@/lib/connectors/types`); keep single-level relative imports (`../`) as-is.
- For the `lib/` → `app/` dependency direction and other architecture rules, see @CONVENTIONS.md.

## Package manager

- This project uses **npm** (not pnpm/yarn). Always use `npm install`, `npm run`, etc.

## Next.js gotchas

- `next/dynamic` with `ssr: false` is a **Client Component API only**. Never use it in Server Components. If you need to lazy-load a client-only component from a Server Component, create a thin Client Component wrapper that does the dynamic import, then use that wrapper in the Server Component.
- `proxy.ts` is the correct file name (Next.js 16 migrated from `middleware.ts` to `proxy.ts`). Do NOT rename it.

## Design System

Always read `DESIGN.md` before making any visual or UI decisions. Font choices, colors, spacing, the disciplined-violet rule, and the media-type palette are defined there. Do not deviate without explicit user approval. Flag any UI code that doesn't match `DESIGN.md`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
