# Design System — openslop

## Product Context

- **What this is:** An AI faceless-video generator. Users describe or paste a script, openslop builds a storyboard of scenes (image, narration, character dialogue, music, sound), and renders a finished video.
- **Who it's for:** Creators producing faceless video at volume who want control over the result and to feel in charge of the process.
- **Space/industry:** AI video tooling. Peers: Runway, Sora, Luma (pro/dark camp); Pika, Captions (consumer/playful camp). openslop belongs in the pro camp.
- **Project type:** Web app (editor) + auth/marketing surfaces.
- **Memorable thing:** "A serious creative studio." Every decision below serves this.

## Aesthetic Direction

- **Direction:** Dark glassmorphism — "a creative studio at night."
- **Decoration level:** Intentional. Film-grain texture, restrained glow, shimmer loaders. Not flat, not maximalist.
- **Mood:** Premium, calm, confident. Pro tooling, not a toy.
- **Core rule (the discipline):** Near-black + glass + grain carry the weight. Violet marks only what is **alive or actionable** (active Generate, focus rings, playhead, the one primary action). The purple glow is a rare earned moment, never an ambient wash. This is what separates "serious studio" from "generic AI-purple wrapper."

## Typography

- **Display/Titles:** Instrument Serif (weight 400) — `.font-title`. Used sparingly for titles only, so it stays special and never turns precious. A serif title is the deliberate departure from the category's neutral grotesks.
- **Body/UI:** Satoshi — `.font-body`. All narration, dialogue, labels, controls.
- **Data/Timestamps:** a monospace (JetBrains Mono or Geist Mono) with tabular-nums for scene times and durations.
- **Cleanup owed:** today four families float (Geist, Satoshi, Instrument Serif, Google Sans Flex). Consolidate to the three above. Drop "Google Sans Flex"; reduce Geist to mono-or-remove.
- **Loading:** Instrument Serif via Google Fonts; Satoshi via Fontshare; mono via Google Fonts. Self-host for production.

## Color

- **Approach:** Restrained. One accent + neutrals; color is rare and meaningful.
- **Canvas:** `#0a0a0a` (near-black).
- **Surfaces (glass):** fill `rgba(255,255,255,0.05)`, border `rgba(255,255,255,0.10)`, `backdrop-blur`.
- **Accent (violet):** `#8b5cf6` (primary), `#a78bfa` (soft) — active Generate, focus rings, playhead, primary action only.
- **Glow:** `#371e64` / `rgba(55,30,100,0.55)` — rare earned highlight (e.g. the live Generate state), never ambient.
- **Text:** `rgba(255,255,255,0.80)` body, `0.40` muted, `0.30` placeholder.
- **Media-type palette (signature — every element type reads at a glance):** character `#fbbf24`, image `#22d3ee`, animated `#e879f9`, clip `#818cf8`, music `#a78bfa`, sound `#34d399`, narration `#9ca3af`. Use as small tags/borders on storyboard scene rows. Keep disciplined so it reads, not confetti.
- **Dark mode:** Dark is the only mode. The stock light `:root` palette in `globals.css` is unreachable (html forces `#0a0a0a`); remove it or commit to dark-only.

## Spacing

- **Base unit:** 4px (Tailwind default).
- **Density:** Compact-to-comfortable. The editor runs dense (`text-[11px]`, tight gaps); reading surfaces (narration) get more room.
- **Scale:** 2xs(2) xs(4) sm(8) md(16) lg(24) xl(32) 2xl(48) 3xl(64).

## Layout

- **Approach:** Hybrid. Editor/canvas is grid-disciplined; composer and player are focal surfaces.
- **Editor shell:** top "Refine your script" copilot bar + violet Generate to its right; vertical scrollable storyboard of scene rows; player panel docked (top or side).
- **Max content width:** ~1100px for the storyboard column.
- **Border radius:** `--radius: 0.625rem` (10px) base; scale to 4xl. Panels `rounded-xl`; pills `rounded-full`.

## Motion

- **Approach:** Intentional. Entrance `fadeInUp` (0.3s ease-out), shimmer loaders, OrbLoader for generation. `prefers-reduced-motion` already honored — keep it.
- **Easing:** enter(ease-out) exit(ease-in) move(ease-in-out).
- **Duration:** micro(50-100ms) short(150-250ms) medium(250-400ms) long(400-700ms).

## Implementation Notes (sharpen backlog)

These are the gaps between the shipped look and a real system. None block; all reduce drift.

1. Tokenize the accent + glass: add `--accent-violet`, `--glow-violet`, `--glass-fill`, `--glass-border` instead of hardcoding `violet-500/30`, `bg-white/5`, `shadow-[0_0_40px_rgba(55,30,100,0.5)]` per component.
2. Tokenize the media-type palette so storyboard surfaces (and the new conversational refine thread) reference tokens, not literals from `status.ts`.
3. Resolve the four-font sprawl (see Typography).
4. Remove the dead light `:root` palette.

## Decisions Log

| Date       | Decision                         | Rationale                                                                                                                                 |
| ---------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-06-09 | Initial design system documented | Codified the existing dark-glass-violet look via /design-consultation; sharpened per "serious creative studio" + disciplined-violet rule. |
