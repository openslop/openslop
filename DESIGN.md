# OpenSlop Design System

OpenSlop is an AI creative media studio: a focused editor plus auth, onboarding, and a projects gallery. This document is the source of truth for visual decisions. Read it before any UI work. Flag any code that deviates.

## Aesthetic

Clean, warm, and quiet. A focused workspace. Surfaces carry the weight; color marks what is live or actionable.

Tokens live in `app/globals.css` (raw palette ramps + semantic tokens, light and dark), exposed to Tailwind via `@theme inline`.

## Theme

Global light + dark via `next-themes` (`attribute="class"`, default light, system enabled). One theme covers every surface — editor, gallery, auth — and nothing is forced light or dark. Light / Dark / System live in the Appearance submenu of the account dropdown (`UserProfile`). The palette ramps flip in `.dark`, so semantic tokens adapt automatically.

## Color

- **Neutrals:** warm, red-tinted greys (`--grey-900` foreground through `--grey-0`).
- **Surfaces:** `--background`, `--surface-recessed` (panels), `--card` / `--surface-elevated` (raised: popovers, select menus, with `--surface-hover` for hovered controls on them), `--element-card` (element cards and side-panel sections, text from `--panel-fg` / `--panel-label`). Borders are hairline (`--border`).
- **Accent — blurple** (`--accent`, `--ring`): focus rings, selection, links, send, and `accent` CTAs only. Disciplined, never an ambient wash.
- **State:** `--destructive` (red), `--success` (green), `--caution` (amber).
- **Media-type tints** (`--media-character/image/clip/animated/music/sound/narration`): the element-card icon color, so each storyboard type reads at a glance. Brighter in dark, deeper in light.
- **Scrims** (`--overlay`, `--on-media`, `--on-media-foreground`): theme-independent dark washes. `bg-overlay` for modal scrims; `bg-on-media/55…80` for chrome floating over media (`--on-media` is solid black, so the opacity modifier sets the strength), paired with `text-on-media-foreground`.

Use semantic tokens (`bg-background`, `text-foreground`, `border-border`, `bg-card`, `text-muted-foreground`, `bg-accent`, `ring-ring`), never raw hexes, `bg-black/N`, or `*-white/N` literals — reach for the scrim tokens for dark washes over media.

## Typography

UI and titles use **Sloptastic** (`--font-sans`, `.font-title`), a clean grotesque; body text and form controls — inputs, textareas, selects, dropdown menus — use **Inter** (`--font-body`). **IBM Plex Mono** (`--font-mono`) for timecodes and durations. Marketing surfaces only: **Instrument Serif** (`--font-serif`, hero headlines) and **Sentient** (`.font-sentient`, the onboarding wordmark).

The scale lives as `@theme` tokens in `app/globals.css`: `text-badge-xs` / `text-badge` / `text-label-xs` / `text-label` / `text-body` / `text-body-lg` / `text-heading-sm` / `text-heading` / `text-heading-lg` / `text-display`. Each bakes in its own line-height, so a bare token needs no `leading-*`; add one only to override, and `font-medium` for weight — except `text-label-xs`, which bakes in weight 475 as the default an explicit `font-*` still overrides. Never hand-pick `text-xs` / `text-sm` or `text-[Npx]` arbitraries. Caveat: `.font-body` / `.font-title` are declared unlayered, so their `line-height` (1.5 / 1.2) beats the token's baked leading wherever they pair (form controls, buttons, titles) — those surfaces need an explicit `leading-*` to change it.

In a dense row, a primary label and its secondary description share one size and weight (e.g. both `text-label`), differentiated by color alone — `text-foreground` for the label, `text-muted-foreground` for the description. Don't shrink or bold the label to set it apart.

## Spacing, radius, elevation

4px base spacing. Radius via `--radius`; cards `rounded-xl`, overlays (modals, popovers, dropdowns, selects) and form controls `rounded-md`, pills `rounded-full`. Depth comes from token elevations `shadow-elevation-1/3/5/10`, not glow — popovers and menus sit at `shadow-elevation-3`.

## Motion

Eases `--ease-casual` / `--ease-productive` / `--ease-expressive`; durations `--duration-faster` / `--duration-fast`. `fadeInUp` for entrances, `shimmer` for skeletons. `prefers-reduced-motion` is honored.

## Texture

Two opt-in treatments, both quiet:

- `.grain` — subtle film grain (theme-tuned `--grain-opacity`) on raised surfaces: dialogs, panel cards, the canvas card, onboarding, the inline copilot. Needs a positioned element; it paints through `::after`. No grain on dense element cards.
- `.dot-grid-bg` — a repeating "+" dot grid, the page backdrop behind the editor and the gallery. Render it as an `aria-hidden`, `pointer-events-none` layer behind content.

No glass. No rainbow backdrops.

## Components

Idiomatic, shadcn-consistent primitives in `components/ui/` built with `class-variance-authority`, tokens only. Icons: masked SVG token set (`components/ui/icons.css`), filled.

Button `variant` covers color only: `default` (near-black inverse, in-tool actions), `accent` (blurple, hero/auth CTAs), `generate` (the generate action's own `--generate` token family, including its disabled state), plus `secondary`/`outline`/`ghost`/`destructive`/`link`. **Dimensions** come from the `size` prop (`sm`/`default`/`cta`/`lg`/`icon`) in `buttonVariants` — never hand-size a button with `h-*`/`px-*`/`text-*` in `className`. Add a named `size` to the variant if you need a new one.
