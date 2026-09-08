# Contributing

PRs and issues welcome. Quick notes below, the real docs are linked.

Code of conduct is in [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## Before you start

- Pick something from the [open issues](https://github.com/openslop/openslop/issues). Comment on it so we know you're on it
- `good first issue` and `size: XS` / `size: S` are the easy ones
- Big stuff (refactors, new deps, new subsystems) open an issue first. Don't want you writing a bunch of code we can't merge

## Setup

See [Getting started](README.md#getting-started) in the README. Couple things:

- npm only. no pnpm, no yarn
- Node 20.9+, CI is on 22
- You only need the Supabase env vars. Every provider without a key falls back to a mock, so no need to pay for any API

## Before you open a PR

Run these, same order as CI:

```bash
npm run lint
npm run format:check
npm run typecheck
npm run knip
npm run build
npm run test:run
npm run test:e2e
```

Don't skip `build`, it catches server bundle stuff typecheck doesn't.

e2e needs a browser: `npx playwright install --with-deps chromium`

## How we write code

Read [CONVENTIONS.md](CONVENTIONS.md). It's strict on purpose. Stuff that gets PRs bounced most:

- One way to do a thing. No one-off wiring
- No `!` non-null assertions (lint fails)
- Fail loudly, don't swallow errors
- `lib/` never imports from `app/` (eslint enforces)
- Server components by default, `"use client"` at the leaves
- No barrel files
- `@/*` alias for imports going 2+ dirs up, `../` is fine for one
- Comments are a last resort. No history in comments, that's what commit messages are for
- Use what's already in the stack (Next, React, Remotion, Zustand, Supabase) before adding a dep

Anything visual: [DESIGN.md](DESIGN.md), not negotiable.

How the pieces fit (connectors, gateways, providers, queue): [ARCHITECTURE.md](ARCHITECTURE.md)

## Tests

Test behavior not internals. Pure helpers and module boundaries. Vitest for unit, Playwright for smoke.

## PRs

- One change per PR
- Title says what, description says why
- Link the issue
- Read your own diff before pushing

## AI stuff

Agent written code is fine, same bar as everything else. Run the checks, read the diff. [AGENTS.md](AGENTS.md) has the agent notes.

## Questions

[Discord](https://discord.gg/zeP5482ced) or open an issue.
