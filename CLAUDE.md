# Coding style

- Follow DRY principles and prefer code reuse where possible and idiomatic (e.g. common components should be abstracted into a HOC or reusable component)
- Prefer code simplicity as much as possible
- Prefer smaller subcomponents and helper functions neatly organized in idiomatic folders as much as possible
- Prefer idiomatic NextJS, React, Supabase, Shadcn, Tailwind conventions and best practices as much as possible
- After each change, run `npx prettier --write .` in project root to ensure formatting is consistent
- Only add comments when an explanation is warranted (e.g. a UI component with an unobvious purpose, intent that cannot be inferred from code, etc.)
- Avoid unnecessary variables, properties, logic, or functions as much as possible
- Keep the code compact, minimal, simple, and easily understandable and readable by humans
- Avoid common React/Typescript/NextJS anti-patterns such as barrel files, prop drilling, etc. (use the vercel-react-best-practices skill for reference)
- Use the `@/*` path alias for imports that traverse 2+ directory levels (e.g. `@/lib/connectors/types`); keep single-level relative imports (`../`) as-is
