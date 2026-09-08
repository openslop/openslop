# Contributing to OpenSlop

Issues and pull requests of all sorts are welcome. This is the short version of how to get a change in. The canonical docs are linked rather than repeated, so if this file and one of them disagree, the linked doc wins.

This project ships with a [Code of Conduct](CODE_OF_CONDUCT.md). By taking part you agree to follow it.

## Before you start

- Look through the [open issues](https://github.com/openslop/openslop/issues). If you want one, comment on it so nobody doubles up.
- `good first issue` and `size: XS` / `size: S` are the on-ramp.
- For anything big (a refactor, a new subsystem, a new dependency) open an issue and talk it through first. It saves you writing code we can't merge.

## Setup

Follow [Getting started](README.md#getting-started) in the README. A few things worth knowing up front:

- This repo uses **npm**. Not pnpm, not yarn. `npm install`, `npm run`.
- Node 20.9 or newer. CI runs 22.
- Only the Supabase variables are required. Any provider whose key is unset falls back to a mock, so you can work on most of the app without paying for an API.

## Before you open a PR

CI runs these in this order. Run them locally and get them green first:

```bash
npm run lint
npm run format:check
npm run typecheck
npm run knip
npm run build
npm run test:run
npm run test:e2e
```

Don't skip `npm run build`. It catches server-bundle breakage that `typecheck` misses, like a type-only import that became a value import.

`npm run test:e2e` needs a Playwright browser. Install it once with `npx playwright install --with-deps chromium`.

## How we write code

[`CONVENTIONS.md`](CONVENTIONS.md) is the style guide and it is deliberately rigid. Read it once before your first PR. The rules that bounce PRs most often:

- One canonical way to do a thing. If your feature needs one-off wiring, rearchitect so it composes from what's already there.
- Deep modules. Simple interface, complexity pushed down behind it.
- No non-null assertions (`!`). Lint fails on them.
- Fail loudly. Never swallow an error on a critical path.
- `lib/` never imports from `app/`. ESLint enforces it.
- Server Components by default. `"use client"` stays at the leaves.
- No barrel files.
- Use the `@/*` alias for imports that cross two or more directories. Single-level `../` is fine.
- Comments are a last resort. Code should explain itself, and history belongs in the commit message, not the source.
- Prefer the stack we already have (Next.js, React, Remotion, Zustand, Supabase) over a new dependency.

[`DESIGN.md`](DESIGN.md) governs anything visual and is not up for negotiation. Read it before touching UI.

[`ARCHITECTURE.md`](ARCHITECTURE.md) explains how connectors, gateways, providers and the generation queue fit together.

## Tests

Test behavior, not internals. Cover the seams: pure helpers and module boundaries. That keeps refactors safe without tests that break every time a file moves.

Vitest for unit tests (`npm run test` to watch). Playwright for smoke tests (`npm run test:e2e`).

## Pull requests

- One focused change per PR.
- A title that says what changed. A description that says why.
- Link the issue it closes.
- Read your own diff before you push.

## AI-assisted contributions

Agent-written code is welcome. It's held to the same bar as everything else, so run the checks and read the diff before you push. [`AGENTS.md`](AGENTS.md) has the workflow notes agents are expected to follow.

## Questions

Ask in the [Discord](https://discord.gg/zeP5482ced) or open an issue.
