# Coding style

- Follow DRY principles and prefer code reuse where possible and idiomatic (e.g. common components should be abstracted into a HOC or reusable component)
- Prefer code simplicity as much as possible
- Prefer smaller subcomponents and helper functions neatly organized in idiomatic folders as much as possible
- Prefer idiomatic NextJS, React, Supabase, Shadcn, Tailwind conventions and best practices as much as possible
- After each change, run the checks from `.github/workflows/ci.yml` (lint, format, typecheck, tests) and fix all failures
- Only add comments when an explanation is warranted (e.g. a UI component with an unobvious purpose, intent that cannot be inferred from code, etc.)
- Avoid unnecessary variables, properties, logic, or functions as much as possible
- Keep the code compact, minimal, simple, and easily understandable and readable by humans
- Avoid common React/Typescript/NextJS anti-patterns such as barrel files, prop drilling, etc. (use the best practices skills in .claude/skills for reference)
- After completing code changes, run the following to review against best practices:
  - `/simplify`
  - `/vercel-composition-patterns`
  - `/web-design-guidelines`
  - `/vercel-react-best-practices`
- Never use non-null assertions (!). Use type guards, default values, or validated helpers instead
- Fail loudly: never catch-and-log errors on critical paths to "keep things going" — propagate the error or surface it explicitly
- Don't wrap one-line utility calls in hooks (e.g. call `insertElement` directly, no `useInsertElement`)
- Use the `@/*` path alias for imports that traverse 2+ directory levels (e.g. `@/lib/connectors/types`); keep single-level relative imports (`../`) as-is

## Architecture

- The layered class hierarchies in `lib/connectors` and `lib/gateway` are intentional: multiple providers per type are planned. Do not flatten them, even though only one provider exists today.

## Package manager

- This project uses **npm** (not pnpm/yarn). Always use `npm install`, `npm run`, etc.

## Next.js gotchas

- `next/dynamic` with `ssr: false` is a **Client Component API only**. Never use it in Server Components. If you need to lazy-load a client-only component from a Server Component, create a thin Client Component wrapper that does the dynamic import, then use that wrapper in the Server Component.
- `proxy.ts` is the correct file name (Next.js 16 migrated from `middleware.ts` to `proxy.ts`). Do NOT rename it.
