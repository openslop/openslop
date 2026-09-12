<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/openslop-lockup-animated-dark.svg">
    <img src="./assets/openslop-lockup-animated-light.svg" alt="OpenSlop" width="560">
  </picture>
</p>

<p align="center"><b>Free, open-source AI video creator.</b></p>

<p align="center">
  <a href="https://openslop.ai"><img src="https://img.shields.io/badge/status-private%20beta-6b6bcf?style=flat" alt="Status: private beta"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-Apache--2.0-blue?style=flat" alt="License: Apache-2.0"></a>
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js" alt="Next.js 16"></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=white" alt="React 19"></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript&logoColor=white" alt="TypeScript 5"></a>
  <a href="https://supabase.com"><img src="https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white" alt="Supabase"></a>
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat&logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4"></a>
  <a href="https://discord.gg/zeP5482ced"><img src="https://img.shields.io/badge/Discord-Join-5865F2?style=flat&logo=discord&logoColor=white" alt="Discord"></a>
</p>

<p align="center">
  <sub><a href="docs/readme/README.zh-CN.md">中文</a> · <a href="docs/readme/README.ja.md">日本語</a> · <a href="docs/readme/README.ko.md">한국어</a> · <a href="docs/readme/README.es.md">Español</a> · <a href="docs/readme/README.fr.md">Français</a> · <a href="docs/readme/README.pt.md">Português</a></sub>
</p>

<p align="center">
  <a href="https://openslop.ai"><b>openslop.ai</b></a>
  &nbsp;·&nbsp;
  <a href="https://app.openslop.ai">app.openslop.ai</a>
</p>

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/openslop-demo-dark.svg">
    <img src="./assets/openslop-demo-light.svg" alt="OpenSlop - your free AI video creator" width="100%">
  </picture>
</p>

---

> **Private beta.** Invite-only right now.
> [Hop on the waitlist at openslop.ai](https://openslop.ai) to get in.

## Overview

OpenSlop wires all your favorite AI tools into one workflow so you can make good-looking video in minutes, no more jumping between ten tabs. You bring your AI accounts, OpenSlop brings the workflow. That's it.

It runs in your browser, nothing to install. Open-source, free forever. Built by engineers from Meta, Google, Stripe, and Dropbox.

## Features

<table>
<tr>
<td width="50%" valign="middle">

### Describe your video

Type one line. Pick 16:9 or 9:16, a language, a model, and a length, or paste a script you already have. Seven templates are there if you need a nudge.

[The composer →](app/components/copilot/ComposerCopilot.tsx)

</td>
<td width="50%">
  <a href="app/components/copilot/ComposerCopilot.tsx"><picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/features/describe-dark.svg">
    <img src="./assets/features/describe-light.svg" alt="The prompt box cycles through example ideas, then a line is typed and sent" width="100%">
  </picture></a>
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Sloppy writes it with you

The copilot lives in the left panel. It reads the script, outlines the story, writes the scenes, and fits each video card to its dialogue. Everything it does lands on the canvas while you watch.

[How a turn works →](ARCHITECTURE.md#sloppy)

</td>
<td width="50%">
  <a href="ARCHITECTURE.md#sloppy"><picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/features/sloppy-dark.svg">
    <img src="./assets/features/sloppy-light.svg" alt="Sloppy thinks, reads, outlines, writes a script, and scenes appear on the canvas" width="100%">
  </picture></a>
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### A storyboard, not a prompt box

Every scene is a stack of cards: narration, character, image, video, sound, music. Edit any prompt, pick a model per card, drag to reorder, and insert wherever you hover.

[The document model →](lib/canvas)

</td>
<td width="50%">
  <a href="lib/canvas"><picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/features/canvas-dark.svg">
    <img src="./assets/features/canvas-light.svg" alt="Hovering a row opens the insert menu with the seven element types and a new Sound card appears" width="100%">
  </picture></a>
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### One click generates everything

Generate all queues every element and runs dependencies first: the video card a scene continues from before the scene itself, an avatar before the image it appears in. Change a prompt later and the card says **Stale** and why.

[The generation graph →](ARCHITECTURE.md#generation-graph)

</td>
<td width="50%">
  <a href="ARCHITECTURE.md#generation-graph"><picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/features/generate-dark.svg">
    <img src="./assets/features/generate-light.svg" alt="Generate all runs the queue, previews fill in, and an edited prompt is marked stale with a reason" width="100%">
  </picture></a>
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Player and timeline

Watch the cut as it fills in, captions word by word. Four lanes underneath: visuals, voice, effects, music. Scrub the ruler, jump by scene, or switch to the storyboard strip.

[The player →](app/components/player)

</td>
<td width="50%">
  <a href="app/components/player"><picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/features/timeline-dark.svg">
    <img src="./assets/features/timeline-light.svg" alt="The player plays with word-by-word captions while the playhead sweeps a four-lane timeline" width="100%">
  </picture></a>
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Bring your own keys

Hosted models come with your account. Paste a key for Anthropic, Runware, Cartesia, or ElevenLabs and their models show up in every picker. Keys live in Supabase Vault and never reach the browser.

[Models and provider keys →](ARCHITECTURE.md#models-and-provider-keys)

</td>
<td width="50%">
  <a href="ARCHITECTURE.md#models-and-provider-keys"><picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/features/providers-dark.svg">
    <img src="./assets/features/providers-light.svg" alt="A Cartesia key is pasted and validated, going from Unverified to Connected" width="100%">
  </picture></a>
</td>
</tr>
</table>

**Also in the box:**

- **[Captions](app/components/canvas/panel/CaptionsPanel.tsx)** — Six presets, twelve fonts, word-by-word or line-by-line reveal, and every color, border, and placement is yours to change.
- **[Export up to 4K](app/components/player/ExportButton.tsx)** — Renders on Remotion Lambda in parallel chunks and hands you an MP4.
- **[Version history](app/components/canvas/panel/CanvasHistoryPanel.tsx)** — Autosaves as you work, folded into checkpoints. View any version and restore it.
- **[Characters and art style](app/components/canvas/elements/AssetsSection.tsx)** — Name a character once and every image, voice line, and avatar stays consistent.
- **[Templates](lib/templates/templates.ts)** — POV Life, Sleep Story, True Crime, and more. Each seeds a style, a narrator, and a length.
- **[Mocks for development](.env.example)** — Leave a provider key unset and its calls fall back to canned results, so you can build without paying.

## Supported providers

Bring your own accounts. A provider whose key is unset falls back to a mock, so none of them is required to run the app.

<p>
  <a href="https://runware.ai"><kbd><img src="https://www.google.com/s2/favicons?domain=runware.ai&amp;sz=64" alt="Runware logo" width="16" valign="middle"> Runware &middot; image, video</kbd></a> &nbsp;
  <a href="https://elevenlabs.io"><kbd><img src="https://www.google.com/s2/favicons?domain=elevenlabs.io&amp;sz=64" alt="ElevenLabs logo" width="16" valign="middle"> ElevenLabs &middot; music, SFX</kbd></a> &nbsp;
  <a href="https://cartesia.ai"><kbd><img src="https://www.google.com/s2/favicons?domain=cartesia.ai&amp;sz=64" alt="Cartesia logo" width="16" valign="middle"> Cartesia &middot; text-to-speech</kbd></a> &nbsp;
  <a href="https://www.anthropic.com"><kbd><img src="https://www.google.com/s2/favicons?domain=anthropic.com&amp;sz=64" alt="Anthropic logo" width="16" valign="middle"> Anthropic &middot; LLM</kbd></a> &nbsp;
  <a href=".env.example"><kbd>+ more, see .env.example</kbd></a>
</p>

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org) 20.9+ (Next.js 16's minimum; CI runs 22)
- A [Supabase](https://supabase.com) project (for auth and database)

### Setup

1. Clone the repo:

```bash
git clone https://github.com/openslop/openslop.git
cd openslop
```

2. Install dependencies:

```bash
npm install
```

3. Copy the annotated env template and fill it in:

```bash
cp .env.example .env.local
```

The Supabase variables are required. Everything else is optional: a provider whose key is unset falls back to a mock.

4. Run the database migrations:

```bash
npm run db:push
```

5. Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and you should see the app.

## Tech stack

| Layer     | Tech                                                                                                         |
| --------- | ------------------------------------------------------------------------------------------------------------ |
| Framework | [Next.js 16](https://nextjs.org) (App Router)                                                                |
| Language  | [TypeScript 5](https://www.typescriptlang.org)                                                               |
| UI        | [React 19](https://react.dev), [Tailwind CSS 4](https://tailwindcss.com), [shadcn/ui](https://ui.shadcn.com) |
| Auth + DB | [Supabase](https://supabase.com) (Auth, Postgres, RLS)                                                       |
| Video     | [Remotion 4](https://remotion.dev) (composition, rendering, player)                                          |
| Storage   | [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) (generated asset storage)                         |
| Icons     | In-house masked-SVG set (`components/ui/icon.tsx` + `icons/`), no icon dependency                            |

## Project structure

```
app/             Next.js routes, API endpoints, and editor components
  api/v1/        REST API per asset type (image, video, music, sfx, tts, llm)
  components/    Editor UI (canvas, video preview, etc.)
lib/
  agent/         Sloppy: tool definitions, registry, prompt and turn context
  connectors/    Editor-facing client API per asset type
  gateway/       HTTP clients to /api/v1/*
  providers/     Server-side vendor adapters (Runware, ElevenLabs, …)
  generation/    Generation queue and job orchestration
  canvas/        Slate document model: element types, guards, OSML parse/serialize
  script/        Script context and refinement
  project/       Per-project Zustand store, autosave, persistence
  video/         Scene layout and render client
  templates/     Prompt templates offered in the composer
  upload/        Client-side image upload
  supabase/      Browser/server Supabase clients
remotion/        Remotion entry point and compositions
supabase/        Database migrations
```

See [`ARCHITECTURE.md`](ARCHITECTURE.md) for how these layers interact.

## Scripts

| Command                   | What it does                |
| ------------------------- | --------------------------- |
| `npm run dev`             | Start the dev server        |
| `npm run build`           | Production build            |
| `npm run lint`            | ESLint                      |
| `npm run format:check`    | Prettier check              |
| `npm run typecheck`       | TypeScript check            |
| `npm run knip`            | Dead-code check             |
| `npm run test:run`        | Run tests once (Vitest)     |
| `npm run test:e2e`        | Smoke tests (Playwright)    |
| `npm run db:push`         | Push migrations to Supabase |
| `npm run remotion:studio` | Open Remotion Studio        |

## Contributing

Contributions welcome. See [`CONTRIBUTING.md`](CONTRIBUTING.md) for setup, the check sequence, and what we look for in a PR.

## Community

<p align="center">
  <a href="https://discord.gg/zeP5482ced"><img src="https://img.shields.io/badge/Discord-Join%20the%20community-5865F2?style=flat&logo=discord&logoColor=white" alt="Join our Discord community"></a>
</p>

Questions, ideas, or just want to hang out? [Join our Discord](https://discord.gg/zeP5482ced) or [email us](mailto:hi@openslop.ai).

Everyone in the community is expected to follow our [Code of Conduct](CODE_OF_CONDUCT.md). To report a problem, email [hi@openslop.ai](mailto:hi@openslop.ai).

<a href="https://github.com/openslop/openslop/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=openslop/openslop" alt="OpenSlop contributors">
</a>

## Star history

<p align="center">
  <a href="https://star-history.com/#openslop/openslop&Date">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=openslop/openslop&type=Date&theme=dark">
      <img src="https://api.star-history.com/svg?repos=openslop/openslop&type=Date" alt="GitHub star history chart for openslop/openslop" width="880">
    </picture>
  </a>
</p>

## License

Licensed under the [Apache License 2.0](LICENSE).
