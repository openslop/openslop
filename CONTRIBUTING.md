# Contributing

All PRs and issues are more than welcome, please feel free to contribute.

Please also refer to our [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## Before you start

- Pick something from the [open issues](https://github.com/openslop/openslop/issues). Comment on it so we know you're on it
- `good first issue` and `size: XS` / `size: S` are ones you probably want to start with
- For bigger stuff (refactors, product engineering-heavy decisions) open an issue first - don't want you writing a bunch of code we can't merge

## Setup

See [Getting started](README.md#getting-started) in the README:

- npm only. no pnpm, no yarn
- Node 20.9+, CI is on 22
- We do not yet support [local mode](https://github.com/openslop/openslop/issues/379), so until then you'll need to link to your own Supabase and Vercel accounts via filling in .env.local
- Supabase is the only hard requirement. Vercel Blob is needed for real generations (that's where providers store output), mocks skip it. Provider keys go in the app, leave them out and you get mocks, so no need to pay for an API

## Before you open a PR

Run these (this is what runs in CI):

```bash
npm run lint
npm run format:check
npm run typecheck
npm run knip
npm run build
npm run test:coverage
npm run test:e2e
```

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

Anything visual/all front-end changes should follow these closely: [DESIGN.md](DESIGN.md).

10k foot view: [ARCHITECTURE.md](ARCHITECTURE.md)

## Tests

Test behavior not internals. Pure helpers and module boundaries. Vitest for unit, Playwright for smoke.

## PRs

- One change per PR
- Title says what, description says why
- Link the issue
- Read your own diff before pushing
- Adding or removing an adapter in `lib/providers/`? Update the **Supported providers** chips in [README.md](README.md#supported-providers) in the same PR

## AI

Agent written code is welcome, same bar as everything else. Run the checks, read the diff. [AGENTS.md](AGENTS.md) has the agent notes.

## Questions

[Discord](https://discord.gg/zeP5482ced) or open an issue.
