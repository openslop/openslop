# OpenSlop Design System

The source of truth for visual decisions across the studio (editor, gallery, auth, onboarding). Read it before any UI work and flag code that deviates.

Clean, warm, quiet. Surfaces carry the weight; color marks what is live or actionable. No glass, no rainbow backdrops.

Tokens live in `app/globals.css`, light and dark, exposed to Tailwind via `@theme inline`.

## Theme

`next-themes`, `attribute="class"`, default light, system enabled. One theme covers every surface; nothing is forced light or dark. Light / Dark / System sit in the Appearance submenu of `UserProfile`. Ramps flip in `.dark`, so semantic tokens adapt on their own.

## Color

Semantic tokens only. Never raw hexes, `bg-black/N`, or `*-white/N`.

- **Neutrals:** warm, red-tinted greys, `--grey-900` (foreground) through `--grey-0`.
- **Surfaces:** `--background`; `--surface-recessed` (panels); `--card` / `--surface-elevated` (popovers, select menus) with `--surface-hover` for hovered controls on them; `--element-card` (element cards and side-panel sections, text from `--panel-fg` / `--panel-label`). Hairline `--border`.
- **Accent:** blurple `--accent` / `--ring`, for focus rings, selection, links, send, and `accent` CTAs only. Never an ambient wash.
- **State:** `--destructive`, `--success`, `--caution`, each with a `-foreground` for solid fills, plus `--caution-soft` / `--caution-soft-foreground` for banners. One ramp per state; never a second red, green, or amber.
- **Media tints:** `--media-character/image/clip/animated/music/sound/narration` color the element-card icon so each storyboard type reads at a glance. Brighter in dark, deeper in light.
- **Scrims:** theme-independent dark washes. `bg-overlay` for modal scrims; `bg-on-media/55…80` over media with `text-on-media-foreground` (`--on-media` is solid black, so the opacity sets the strength).

## Typography

- **Slopella** (`--font-sans`, `.font-title`): UI and titles.
- **Inter** (`--font-body`): body text and form controls (inputs, textareas, selects, dropdown menus).
- **`font-numeric`** (Slopella with `tnum`): numbers that update in place (timecodes, durations, counters, percentages) and preformatted output (`DisclosureText` / `DisclosureJson`, with `whitespace-pre-wrap`). Never pair it with `tabular-nums`. Skip it only where the digit count itself changes, which tabular figures cannot steady anyway (the player's "N of M generated").
- Marketing only: **Instrument Serif** (`--font-serif`) for hero headlines, **Sentient** (`.font-sentient`) for the onboarding wordmark. There is no monospace stack.

Sizes: `text-badge-xs` / `text-badge` / `text-label-xs` / `text-label` / `text-body` / `text-body-lg` / `text-heading-sm` / `text-heading` / `text-heading-lg` / `text-display`. Never `text-xs`, `text-sm`, or `text-[Npx]`.

- Each bakes its own line-height, so add `leading-*` only to override it, and `font-medium` for weight. `text-label-xs` also bakes weight 475.
- `.font-body` and `.font-title` are unlayered, so their line-height (1.5 / 1.2) beats a token's baked leading wherever they pair (form controls, buttons, titles). Those need an explicit `leading-*`.
- In a dense row, a label and its description share one size and weight, separated by color alone: `text-foreground` against `text-muted-foreground`.

## Spacing, radius, elevation

4px base spacing. Radius from `--radius`: cards `rounded-xl`, overlays and form controls `rounded-md`, pills `rounded-full`. Depth is `shadow-elevation-1/3/5/10`, never glow; popovers and menus sit at 3.

## Motion

Eases `--ease-casual` / `--ease-productive` / `--ease-expressive`, durations `--duration-faster` / `--duration-fast`. `fadeInUp` for entrances, `shimmer` for skeletons. `prefers-reduced-motion` is honored.

## Texture

Two opt-in treatments, both quiet:

- `.grain`: film grain (`--grain-opacity`) on raised surfaces (dialogs, panel cards, the canvas card, onboarding, the inline copilot). Needs a positioned element and paints through `::after`. Not on dense element cards.
- `.dot-grid-bg`: the "+" grid behind the editor and gallery. Render it `aria-hidden` and `pointer-events-none`, behind content.

## Components

shadcn-consistent primitives in `components/ui/`, built with `class-variance-authority`, tokens only. Icons are a masked SVG set (`components/ui/icons.css`), filled.

Button `variant` sets color only: `default` (near-black inverse, in-tool actions), `accent` (blurple, hero/auth CTAs), `generate` (the `--generate` family, including its disabled state), `panel` (the side panel's quiet look, for chrome next to a primary action), plus `secondary` / `outline` / `ghost` / `destructive` / `link`. Size comes from the `size` prop (`sm`/`default`/`cta`/`lg`/`icon`): never hand-size with `h-*`, `px-*`, or `text-*`; add a named size instead.

Style an unavailable control through the `unavailable:` variant, which covers `:disabled` and `aria-disabled` alike, so one that stays hoverable for its tooltip still looks unavailable.
