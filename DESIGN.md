# OpenSlop Design System

Read before UI work. Flag code that deviates.

## Principles

- Clean, warm, quiet. Neutral surfaces carry layout; color only marks what is live, actionable, or needs attention.
- Depth from surfaces and shadow. No glass, glow, gradients, or ambient color washes.
- Primitives in `components/ui/` (shadcn-style, `class-variance-authority`) own the look. Feature code composes them and never restyles them.
- One meaning, one look: a color, variant, or size means the same thing everywhere.
- Reuse before adding: existing primitive, then a new named variant or size on it, then a new primitive. No one-off classes at the call site.
- A look used in more than one place lives in one home: a primitive variant or an `@utility` (`focus-ring`, `elevated-surface`, `font-numeric`).

## Tokens

`app/globals.css`, in three layers:

1. **Ramps:** raw palette steps (`--grey-*`, `--blurple-*`, ...), flipped under `.dark`.
2. **Semantic tokens:** named for a role (`--surface-elevated`, `--caution`), pointing at ramp steps.
3. **Tailwind:** semantic tokens exposed through `@theme inline`.

- Components use semantic tokens only. Never ramps, raw hexes, `bg-black/N`, or `*-white/N`.
- A new token gets a role name, a value in both themes, and an `@theme inline` entry.
- One token per role. Never a second red, green, or amber.

## Theme

`next-themes` with a `.dark` class, light by default, system supported. Nothing is forced light or dark, and components never branch on theme.

## Color

- **Neutrals:** warm, red-tinted greys. Hierarchy comes from `foreground` against `muted-foreground` before size or weight.
- **Surfaces:** recessed (`surface-recessed`), page (`background`), raised (`card`, `element-card`, `surface-elevated`), separated by a hairline `border`.
- **Primary:** `generate`, for the main action.
- **Accent:** blurple `accent` / `ring`, for focus, selection, links, and entry-page calls to action only.
- **State:** `destructive`, `success`, `caution`, `tertiary`, each with a `-foreground` for solid fills, plus a soft form for banners.
- **Indicator:** berry, for caution on content only. Reads as status, never as a button.
- **Media tints:** one per media type, only to tell types apart.
- **Scrims:** `overlay` and `on-media` are theme-independent dark washes. Opacity sets the strength.

## Typography

- **Slopella** (`font-sans`, `font-title`): interface and titles.
- **Inter** (`font-body`): body copy and form controls.
- **`font-numeric`:** Slopella's tabular figures, for numbers that update in place. Never combine with `tabular-nums`.
- **Instrument Serif**, **Sentient:** marketing only. No monospace stack.

- Sizes come from the named scale (`text-badge-xs` to `text-hero`). Never `text-xs`, `text-sm`, or `text-[Npx]`.
- Each size bakes its line-height. Add `leading-*` only to override, and wherever `font-body` or `font-title` applies, since their unlayered line-height wins.

## Spacing, radius, elevation

- 4px spacing grid.
- Radius from `--radius`: cards `rounded-xl`, controls and overlays `rounded-md`, pills `rounded-full`.
- Depth from `shadow-elevation-1/3/5/10` only. Popovers and menus sit at 3.

## Buttons

- `variant` sets color, `size` sets dimensions. Never hand-size with `h-*`, `px-*`, or `text-*`; add a named size.
- Loudest to quietest: `generate` (primary, one per context), `accent` (entry-page calls to action), `secondary`, `outline`, `panel` / `ghost` (quiet chrome), `link` (in running text). `destructive` removes things.
- Icon buttons follow the same ladder and name their action in a tooltip and an accessible label.
- Unavailable controls style through the `unavailable:` variant (`:disabled` or `aria-disabled`). `hover:` and `active:` skip those states.

## Badges

- Status, never actions.
- Neutral facts: `muted`, or `subtle` inside a line of text. Caution on content: `indicator` with a filled icon. Other states use their own ramp.

## Icons

One filled, masked SVG set (`components/ui/icons/`) that inherits color and size from its text. No icon dependency.

## Motion and texture

- **Motion:** shared eases (`--ease-casual/productive/expressive`) and durations (`--duration-faster/fast`). `fadeInUp` for entrances, `shimmer` for loading. Respect `prefers-reduced-motion`.
- **Grain:** `.grain` on raised surfaces, not on dense cards.
- **Dot grid:** behind workspaces, through `<DotGrid />`.
- **Ambient light:** the hero composer only.
