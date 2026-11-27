# OpenSlop Design System

A snapshot of how the studio looks and why. Read it before UI work, and flag code that drifts from it.

## Philosophy

Clean, warm, quiet. Surfaces carry the layout and color carries meaning: a hue appears only where something is live, actionable, or needs attention. Everything else is warm neutral. Depth comes from layered surfaces and soft shadows, never from glass, glow, or gradients. When in doubt, take something away.

Every visual decision is a token. Components in `components/ui/` own the look, built with `class-variance-authority`, and feature code composes them without restyling. A new need becomes a new named variant or size on the primitive, never one-off classes at the call site.

## Tokens and theme

Tokens live in `app/globals.css` and reach Tailwind through `@theme inline`. Light and dark share one set of semantic names; the raw ramps flip under `.dark`, so components never branch on theme. Use semantic tokens, never raw hexes or palette steps.

## Color

- **Neutrals:** a warm, slightly red-tinted grey ramp. Text runs from `foreground` to `muted-foreground`; hierarchy within a block comes from these two before size or weight.
- **Surfaces:** a small stack from recessed (`surface-recessed`) through the page (`background`) to raised (`card`, `element-card`, `surface-elevated`), separated by a hairline `border`.
- **Primary:** `generate`, a deep wine in light and a pale rose in dark, is the color of the main action in a context.
- **Accent:** blurple `accent` marks focus, selection, and links, plus the call to action on entry pages. It is never an ambient wash.
- **State:** one ramp each for `destructive`, `success`, `caution`, and `tertiary`, each with a `-foreground` for solid fills and a soft form for banners.
- **Indicator:** a berry tint for caution that sits on content, such as stale or low. It should read as a status, never as a button.
- **Media tints:** one hue per media type, used only to tell types apart at a glance.
- **Scrims:** `overlay` and `on-media` are theme-independent dark washes for modals and text over media.

## Typography

- **Slopella** (`font-sans`, `font-title`) for interface and titles.
- **Inter** (`font-body`) for body copy and form controls.
- **`font-numeric`** for numbers that update in place, so digits keep their width.
- **Instrument Serif** and **Sentient** are for marketing surfaces only.

Size comes from the named scale (`text-badge-xs` up to `text-hero`). Each step bakes its line-height and tracking, so reach for `leading-*` or a weight only to override. Never use raw Tailwind sizes or pixel values.

## Spacing, shape, depth

- **Spacing:** a 4px grid. Dense tools stay tight and marketing pages breathe.
- **Shape:** radius derives from `--radius`. Containers are the roundest, controls are moderate, and chips are pills.
- **Depth:** a single elevation scale (`shadow-elevation-1/3/5/10`). The higher a layer floats, the stronger its shadow, and popovers and menus share one level.

## Buttons

`variant` sets color and `size` sets dimensions; never hand-size a button with height, padding, or text classes.

- **`generate`:** the primary action. Use at most one per context.
- **`accent`:** the call to action on entry surfaces such as auth and landing pages.
- **`secondary`:** a bordered, neutral action that sits beside the primary one.
- **`panel` and `ghost`:** quiet chrome that is present without competing for attention.
- **`outline`:** a bordered action with no fill, for neutral actions that shouldn't add a surface.
- **`destructive`:** removes something, usually behind a confirmation.
- **`link`:** an action set in running text.
- **Icon buttons:** follow the same quiet-to-loud logic and carry a tooltip that names the action.

An unavailable control keeps its place and tooltip and fades through the `unavailable:` variant. Inert controls never react to hover or press.

## Badges and chips

Badges are status, not actions. Neutral facts use `muted`, or `subtle` when they sit inside a line of text. State uses its own ramp, and caution on content uses `indicator` with a filled icon. Amounts animate as they change and shimmer while loading.

## Surfaces and overlays

- **Cards and panels:** group content on raised surfaces.
- **Dialogs, popovers, and menus:** float above the page, take a scrim when modal, and return focus when they close.
- **Empty and loading states:** use the shared empty-state and skeleton primitives, never ad hoc spinners or blank space.

## Iconography

One filled, masked SVG set (`components/ui/icons/`) that inherits color and size from its text. Icons support a label and never replace one, except on icon buttons, which name their action in a tooltip and an accessible label.

## Motion and texture

- **Motion:** short and purposeful. Shared eases (`--ease-casual/productive/expressive`) and durations, with fade-up for entrances and shimmer for loading. Motion respects `prefers-reduced-motion`.
- **Texture:** opt-in and quiet. Film grain on raised surfaces, a dot grid behind workspaces, and ambient light reserved for the single hero moment.
