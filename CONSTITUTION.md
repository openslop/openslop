# Coding Style

## General

- Nearly all code should be declarative. It should read as a straightforward config file with minimal dynamism and complexity. Any code that absolutely must be imperative should be folded into small, simple, well-tested, idiomatically named pure helpers that have a clear, singular purpose, are minimally opinionated and are maximally reusable
- Prefer colocating logic where possible either in the same directly or even file. Helpers and components that are re-used in more than one place should ideally be in their own file (or colocated with helpers within the same domain or with similar concerns) in a universally and centrally accessible location that's idiomatically named
- Concerns between functions, components, classes, hooks, routes, handlers, etc. should never leak and instead be well-contained and well-separated.
- Each function, component, class, hook, route, handler, etc. should be as dumb and simple as possible. Complicated or code with high cycolmatic complexity is code smell and should be avoided by design. Seriously question whether the design requirements justify this complexity - in the vast majority of cases, they don't. This may sometimes mean compromising design requirements for simplicity.
- Prefer breadth-first expansion of the codebase architecture instead of depth-first. Deeply nested logic harbors cruft and bugs. For instance, instead of overloading code paths with many concerns and deeply nested logic branches or helpers, consider using a simple, straightforward abstraction that lets users hotswap well-tested modular components (e.g. plugins, hooks, etc.) that neatly encapsulate their own concerns and don't leak complexity elsewhere.
- There should be no tight coupling or implicit dependencies between functions, components, classes, hooks, routes, handlers, etc.
- Code should be self-documenting as much as possible. Comments are generally an anti-pattern and must only exist when it is truly impossible to convey tribal or historical context through function/variable/object names.
- The codebase should be architected in a way that is rigid and highly opinionated. There should at most one canonical way of implementing a feature and it should be as declarative, straightfoward, dumb, and simple as possible. If not, then the codebase must be rearchitected to support this feature natively that doesn't require one-off special case handling.
- Code must be as DRY as possible without overengineering.
- Favor popular, widely-used, well-tested third party libraries over hand-rolling custom primitives.
- Utilize off-the-shelf helpers from within our existing dependencies as much as possible. Consider the most idiomatic solution within our existing choice of technologies (NextJS, React, Remotion, Zustand, Supabase, Vercel, AWS) before considering adding another dependency. Hand-rolling custom logic that can easily be replaced with a library is a last-resort and should only be done when the logic is minimal, simple, and absolutely must be highly custom to this app.
- There should be almost no special-case one-off implementations of a specific feature. It is likely that features will eventually need to be reused across components, elements, or variants. There should be a single, idiomatic, unopinionated implementation of each feature that must be decoupled from any specific component and be reusable across a variety of components.
- Any feature that seems like it needs complex wiring to support is indicative of a warranted redesign or reachitecturing of the existing codebase so that the feature can be wired up using existing infrastructure instead of special-cased one-off logic.

## Frontend

- Presentational components should be as dumb, declarative, and simple as possible. Occassional conditional logic in presentional components is acceptable only when it serves a singular, clear and simple presentational concern.
- Minimize one-off CSS-in-JS outside of the component library. Follow a single, unified design system, and each component from our component library should adhere to this design system off the shelf. Components within our design library should be written in a highly opinionated way and should strictly enforce the design system by default when dropped in without needing one-off custom Tailwind classing.
- There should be a clear, simple, idiomatic component heirarchy that also enforces a style heirarchy. Components must be only usable in a highly opinionated way that minimize the need to specify custom Tailwind classes in higher level components.
- No prop drilling. For props that need to be shared across a single level of nesting, share context via a provider
- Components must be composable and be explicit about what they render

## Backend

- Common functionality such as middleware, rate-limiting, caching, authentication, authorization, validation, queueing, etc. should be resused idiomatically across routes instead of reimplemented as one-offs
- Use polymorphism (e.g. subclassing an abstract class that enforces a strict contract) so that use-case variantations can be explicit about their behavior and concerns for each variant are well-contained and easily extendable
- Backend code should also be as dumb and simple as possible. No single function, route, handler, or class should be overloaded with complexity. Instead, complexity should be dispersed throughout multiple code components in an unopinionated, modular way such that the whole is greater than the sum of its parts
