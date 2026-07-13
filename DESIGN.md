# OpenSlop Design System

OpenSlop is an AI creative media studio: a focused editor plus auth, onboarding, and a projects gallery. This document is the source of truth for visual decisions. Read it before any UI work. Flag any code that deviates.

## Aesthetic

Clean, warm, and quiet. The tool is a bright focused workspace; the gallery is a dark immersive showcase. Surfaces carry the weight; color marks what is live or actionable.

Tokens live in `app/globals.css` (raw palette ramps + semantic tokens, light and dark), exposed to Tailwind via `@theme inline`.

## Theme

Global light + dark via `next-themes` (`attribute="class"`, default light, no system). Editor surfaces read light; the projects gallery reads dark. Both are themeable; a `ThemeToggle` lives in shared chrome. The palette ramps flip in `.dark`, so semantic tokens that reference them adapt automatically.

## Color

- **Neutrals:** warm, red-tinted greys (`--grey-900` foreground through `--grey-0`).
- **Surfaces:** `--background`, `--surface-recessed` (panels), `--card` / `--surface-elevated` (raised; popovers and select menus sit here, with `--surface-hover` for hovered controls on them). Borders are hairline (`--border`).
- **Accent — blurple** (`--accent`, `--ring`): focus rings, selection, links, send, and `accent` CTAs only. Disciplined, never an ambient wash.
- **State:** `--destructive` (red), `--success` (green), `--caution` (amber).
- **Media-type tints** (`--media-character/image/clip/animated/music/sound/narration`): used as the element-card icon color so each storyboard type reads at a glance. Brighter in dark, deeper in light.
- **Scrims** (`--overlay`, `--on-media`, `--on-media-foreground`): theme-independent dark washes. `bg-overlay` for modal/dialog scrims; `bg-on-media/55…80` for chrome floating over media or video (`--on-media` is solid black, so the opacity modifier sets the strength), paired with `text-on-media-foreground`.

Use semantic tokens (`bg-background`, `text-foreground`, `border-border`, `bg-card`, `text-muted-foreground`, `bg-accent`, `ring-ring`), never raw hexes, `bg-black/N`, or `*-white/N` literals — reach for the scrim tokens above for dark washes over media.

## Typography

UI and titles use **Sloptastic** (`--font-sans`, `.font-title`), a clean grotesque; body text and form controls — inputs, textareas, selects, and dropdown menus — use **Inter** (`--font-body`). **IBM Plex Mono** (`--font-mono`) for timecodes and durations. Two display faces for marketing surfaces only: **Instrument Serif** (`--font-serif`, hero headlines) and **Sentient** (`--font-sentient`, the onboarding wordmark). `.font-title` is Sloptastic with tight tracking; `.font-body` is Inter.

The scale lives as `@theme` tokens in `app/globals.css`: use the `text-badge-xs` / `text-badge` / `text-label-xs` / `text-label` / `text-body` / `text-body-lg` / `text-heading-sm` / `text-heading` / `text-heading-lg` / `text-display` utilities — named font-sizes that each bake in a matching line-height, so a bare token (e.g. `text-body`) needs no `leading-*`. Add `leading-*` only to deliberately override the baked leading, and `font-medium` for a heavier weight. Don't hand-pick raw `text-xs` / `text-sm` or `text-[Npx]` arbitraries. Caveat: `.font-body` / `.font-title` are declared unlayered, so their `line-height: 1.5` / `1.2` beats the token's baked leading on any surface that pairs them (form controls, buttons, titles) — those surfaces take their leading from the font class, not the size token, and need an explicit `leading-*` to change it.

In a dense row, a primary label and its secondary description share one size and weight (e.g. both `text-label`), differentiated by color alone — `text-foreground` for the label, `text-muted-foreground` for the description. Don't shrink or bold the label to set it apart.

## Spacing, radius, elevation

4px base spacing. Radius via `--radius`; cards `rounded-xl`, overlays (modals, popovers, dropdowns, selects) and form controls (inputs, textareas, select triggers) `rounded-md`, pills `rounded-full`. Depth comes from token elevations `shadow-elevation-1/3/5/10`, not glow — popovers and menus sit at `shadow-elevation-3`.

## Motion

Eases `--ease-casual` / `--ease-productive` / `--ease-expressive`; durations `--duration-faster` / `--duration-fast`. `fadeInUp` for entrances, `shimmer` for skeletons. `prefers-reduced-motion` is honored.

## Texture

One opt-in treatment: subtle film grain (`.grain`, theme-tuned `--grain-opacity`) plus an optional soft blurple radial (`<Glow/>`). Tasteful and quiet. Allowed on landing/auth, the gallery, empty states, and editor chrome. No grain on dense element cards. No glass. No rainbow backdrops.

## Components

Idiomatic, shadcn-consistent primitives in `components/ui/` built with `class-variance-authority`, tokens only. Buttons: `default` (near-black inverse, for in-tool actions), `accent` (blurple, for hero/auth CTAs), plus `secondary`/`outline`/`ghost`/`icon`/`destructive`. Icons: masked SVG token set (`icons.css`), filled.

Button **dimensions** come from the `size` prop (`sm`/`default`/`lg`/`icon`) defined in `buttonVariants` — never hand-size a button with `h-*`/`px-*`/`text-*` in `className`. Add a named `size` to the variant if you need a new one.
