# Coding Conventions

The single canonical way we write code here. Humans and agents follow it.

## Principles

- Write declarative code that reads like config. Fold any necessary imperative logic into small, well-named, well-tested pure helpers with one clear purpose.
- Keep every unit dumb and simple. High cyclomatic complexity is a code smell. Question whether the requirement justifies it (it usually does not), then design it away. Simplicity wins the tradeoff.
- Stay DRY without overengineering (YAGNI). No premature abstraction.
- Build each feature one canonical, opinionated way. If a feature needs special-case wiring, treat that as a signal to rearchitect so it composes from existing infrastructure, not a license for a one-off.
- Favor breadth over depth. Prefer hot-swappable, self-contained modules (plugins, hooks) over deeply nested branches, which harbor cruft and bugs.
- Write self-documenting code. Comments are an antipattern except for genuinely irreducible tribal context that no name can convey.
- Keep low-level helpers unopinionated and reusable. Keep high-level architecture and components opinionated and rigid.

## Structure and reuse

- Colocate logic. Promote anything reused in 2+ places into one idiomatically named, centrally accessible home. No barrel files.
- Reach for popular, well-tested, off-the-shelf libraries before hand-rolling. Exhaust idiomatic solutions in our stack (Next.js, React, Remotion, Zustand, Supabase, Vercel, AWS) before adding a dependency. Hand-roll only when the logic is minimal and must be highly custom to this app.
- Allow no tight coupling or implicit dependencies. Concerns must never leak across functions, components, hooks, routes, or handlers.

## Frontend

- Keep presentational components dumb and declarative. Use conditional logic only when it serves one clear presentational concern.
- Enforce the design system off-the-shelf. Components ship the system by default, with minimal one-off Tailwind in higher-level components. Honor the component and style hierarchy.
- No prop drilling. Share state one level down via a context provider.
- Keep components composable and explicit about what they render.

## Backend

- Reuse cross-cutting concerns (middleware, rate-limiting, caching, auth, validation, queueing) idiomatically across routes. Never reimplement them as one-offs.
- Use polymorphism (an abstract base enforcing a strict contract) so each variant stays explicit and self-contained.
- Keep handlers, routes, and classes simple. Disperse complexity across small modular units instead of overloading one.

## Hard rules

- Never use non-null assertions (`!`). Use type guards, defaults, or validated helpers.
- Fail loudly. Never swallow errors on a critical path to keep going. Propagate or surface them.
