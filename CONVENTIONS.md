# Coding Conventions

How we write code here, for humans and agents. The codebase is deliberately rigid and opinionated. These are strong defaults, not suggestions. Deviate only when you can clearly justify why.

## Principles

- One canonical way to build each feature, and it should be declarative, dumb, and simple. There's at most one obvious way to do a thing. If a feature needs special-case wiring, that's a signal to rearchitect so it composes from what's already there, never a license for a one-off. Solve the class of problem, not the instance.
- Almost no special-case, one-off wiring. Build a feature once, decoupled from any specific caller, and reuse it everywhere. Duplicating a few lines is fine; a premature shared abstraction is not.
- Prefer deep modules: a simple interface over a powerful implementation (Ousterhout). Push complexity down behind the interface instead of leaking it to callers. Deep modules, shallow call paths.
- Separate policy from mechanism. Low-level helpers stay unopinionated and reusable. High-level code that wires them together is rigid and opinionated, and owns the policy.
- Grow out, not down. Extend the app by adding sister modules and plugins, not by nesting helpers and conditionals like a russian doll. Flat beats nested. Deep nesting hides cruft and bugs.
- Every unit stays as dumb and simple as possible. High cyclomatic complexity is a code smell, and it creeps in one cut corner at a time, so refuse each one and sweat the details (Ousterhout). The requirements almost never justify it, so design it away. When simplicity and a nice-to-have collide, simplicity usually wins.
- Write declarative code that reads like config. Keep the unavoidable imperative bits in small, well-named, tested pure functions.
- Define errors out of existence where you can. Design the API so the edge case can't arise in the first place, not so it gets swallowed (Ousterhout).

## Structure and reuse

- DRY is about knowledge, not text. Each piece of knowledge gets one home. But duplication is cheaper than the wrong abstraction (Metz), so wait for the third use before extracting (rule of three), and don't abstract before you need it (YAGNI).
- Don't reinvent. Reach for a popular, well-tested library before hand-rolling, and exhaust what our stack already does (Next.js, React, Remotion, Zustand, Supabase, Vercel, AWS) before adding a dependency. Hand-roll only when the logic is tiny and must be custom to this app.
- Nothing leaks. No tight coupling, no hidden dependencies, no concerns bleeding across modules. Colocate logic, and give shared code one idiomatically named home. No barrel files.
- Dependencies point one way. `lib/` is the domain layer and never imports from `app/` (the UI); shared logic lives in `lib/`. ESLint-enforced.
- Comments are a last resort, not a habit. Write one only where a choice would look odd or arbitrary to a first-time reader with no context. Never comment history: what broke, what the code used to be, why an earlier attempt failed. That belongs in the commit message.
- Test behavior, not internals. Cover the seams (pure helpers and module boundaries) so refactors stay safe.

## Frontend

- Server Components by default. Keep `"use client"` at the leaves, fetch data on the server, and reach for a client component only for interactivity.
- Presentational components stay dumb: declarative, composable, and explicit about what they render. Conditional logic only when it serves one clear presentational concern.
- The design system is off the shelf and non-negotiable. Components ship it by default, with no one-off Tailwind in higher-level components. Honor the component and style hierarchy. See DESIGN.md.
- Composition over context. Don't thread props through layers that don't use them; prefer composition with children. Reach for context only for genuinely cross-cutting state, never just to skip a level.
- Accessible by default. Semantic HTML, labels, and keyboard support aren't optional.

## Backend

- Share cross-cutting concerns. Middleware, rate-limiting, caching, auth, validation, and queueing each get one implementation reused across routes, never a one-off.
- Make variants explicit through a contract. Prefer a registry, factory, or discriminated union over scattered type-switches. Composition over inheritance. Each variant stays self-contained.
- Parse, don't validate. Check external input once at the boundary (zod) into typed data, then trust the types inward.
- Keep handlers thin. Routes and handlers stay simple. Push the complexity into small, deep modules.

## Hard rules

- Fail loudly. Expected failures return a typed result (validation, not-found); the unexpected throws and never passes silently. Never swallow an error on a critical path to keep going. Propagate it or surface it.
- No non-null assertions (!). Use type guards, defaults, or validated helpers. Lint-enforced.
