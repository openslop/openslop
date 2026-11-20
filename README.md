<p align="center">
  <img src="./assets/openslop-lockup-animated-light.svg#gh-light-mode-only" alt="OpenSlop" width="560">
  <img src="./assets/openslop-lockup-animated-dark.svg#gh-dark-mode-only" alt="OpenSlop" width="560">
</p>

<p align="center"><b>Free, open-source AI video creator.</b></p>

<p align="center">
  <a href="https://openslop.ai"><img src="https://img.shields.io/badge/status-private%20beta-6b6bcf?style=flat" alt="Status: private beta"></a>
  <a href="#local-mode"><img src="https://img.shields.io/badge/runs%20on-macOS%20%7C%20Windows%20%7C%20Linux-555555?style=flat" alt="Runs on macOS, Windows and Linux"></a>
  <a href="https://github.com/openslop/openslop/actions/workflows/ci.yml?query=branch%3Amaster"><img src="https://github.com/openslop/openslop/actions/workflows/ci.yml/badge.svg?branch=master" alt="CI"></a>
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
  <img src="./assets/openslop-demo-light.svg#gh-light-mode-only" alt="OpenSlop - your free AI video creator" width="100%">
  <img src="./assets/openslop-demo-dark.svg#gh-dark-mode-only" alt="OpenSlop - your free AI video creator" width="100%">
</p>

---

> **Private beta.** Invite-only right now.
> [Join the waitlist at openslop.ai](https://openslop.ai), or [use local mode](#local-mode) to run it on your own computer today.

## Overview

OpenSlop wires all your favorite AI tools into one workflow so you can make good-looking video in minutes, no more jumping between ten tabs. You bring your AI accounts, OpenSlop brings the workflow. That's it.

It runs in your browser, nothing to install. Open-source, free forever. Built by engineers from Meta, Google, Stripe, and Dropbox.

## Features

<table>
<tr>
<td width="50%" valign="middle">

### Describe your video

Type one line. Pick 16:9 or 9:16, a language, a model, and a length, or paste a script you already have. Seven templates are there if you need a nudge.

[The composer →](app/components/copilot/composer-copilot.tsx)

</td>
<td width="50%">
  <img src="./assets/features/describe-light.svg#gh-light-mode-only" alt="The prompt box cycles through example ideas, then a line is typed and sent" width="100%">
  <img src="./assets/features/describe-dark.svg#gh-dark-mode-only" alt="The prompt box cycles through example ideas, then a line is typed and sent" width="100%">
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Sloppy writes it with you

The copilot lives in the left panel. It reads the script, outlines the story, writes the scenes, and fits each video card to its dialogue. Everything it does lands on the canvas while you watch.

[How a turn works →](ARCHITECTURE.md#sloppy)

</td>
<td width="50%">
  <img src="./assets/features/sloppy-light.svg#gh-light-mode-only" alt="Sloppy thinks, reads, outlines, writes a script, and scenes appear on the canvas" width="100%">
  <img src="./assets/features/sloppy-dark.svg#gh-dark-mode-only" alt="Sloppy thinks, reads, outlines, writes a script, and scenes appear on the canvas" width="100%">
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### A storyboard, not a prompt box

Every scene is a stack of cards: speech, image, video, sound, music. Edit any prompt, pick a model per card, drag to reorder, and insert wherever you hover.

[The document model →](lib/canvas)

</td>
<td width="50%">
  <img src="./assets/features/canvas-light.svg#gh-light-mode-only" alt="Hovering a row opens the insert menu with the five element types and a new Sound card appears" width="100%">
  <img src="./assets/features/canvas-dark.svg#gh-dark-mode-only" alt="Hovering a row opens the insert menu with the five element types and a new Sound card appears" width="100%">
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### One click generates everything

Generate all queues every element and runs dependencies first: the video card a scene continues from before the scene itself, an avatar before the image it appears in. Change a prompt later and the card says **Stale** and why.

[The generation graph →](ARCHITECTURE.md#canvas-and-generation)

</td>
<td width="50%">
  <img src="./assets/features/generate-light.svg#gh-light-mode-only" alt="Generate all runs the queue, previews fill in, and an edited prompt is marked stale with a reason" width="100%">
  <img src="./assets/features/generate-dark.svg#gh-dark-mode-only" alt="Generate all runs the queue, previews fill in, and an edited prompt is marked stale with a reason" width="100%">
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Player and timeline

Watch the cut as it fills in, captions word by word. Four lanes underneath: visuals, speech, effects, music. Scrub the ruler, jump by scene, or switch to the storyboard strip.

[The player →](app/components/player)

</td>
<td width="50%">
  <img src="./assets/features/timeline-light.svg#gh-light-mode-only" alt="The player plays with word-by-word captions while the playhead sweeps a four-lane timeline" width="100%">
  <img src="./assets/features/timeline-dark.svg#gh-dark-mode-only" alt="The player plays with word-by-word captions while the playhead sweeps a four-lane timeline" width="100%">
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Bring your own keys

Hosted models come with your account. Paste a key for Anthropic, Runware, Cartesia, or ElevenLabs and their models show up in every picker. Keys live in Supabase Vault and never reach the browser.

[Models and provider keys →](ARCHITECTURE.md#models-and-keys)

</td>
<td width="50%">
  <img src="./assets/features/providers-light.svg#gh-light-mode-only" alt="A Cartesia key is pasted and validated, going from Unverified to Connected" width="100%">
  <img src="./assets/features/providers-dark.svg#gh-dark-mode-only" alt="A Cartesia key is pasted and validated, going from Unverified to Connected" width="100%">
</td>
</tr>
<tr>
<td width="50%" valign="middle">

### Run it on your computer

Run OpenSlop on your own Mac, Windows or Linux computer. Your projects and videos stay with you.

[Local mode →](#local-mode)

</td>
<td width="50%">
  <img src="./assets/features/local-light.svg#gh-light-mode-only" alt="A terminal runs npm run local, then OpenSlop opens at localhost:3000 with projects saved on this computer" width="100%">
  <img src="./assets/features/local-dark.svg#gh-dark-mode-only" alt="A terminal runs npm run local, then OpenSlop opens at localhost:3000 with projects saved on this computer" width="100%">
</td>
</tr>
</table>

**Also in the box:**

- **[Captions](app/components/canvas/panel/captions-panel.tsx)** — Six presets, twelve fonts, an adjustable line length, and every color, border, and placement is yours to change.
- **[Export up to 4K](app/components/player/export-button.tsx)** — Renders on Remotion Lambda in parallel chunks and hands you an MP4.
- **[Version history](app/components/canvas/panel/canvas-history-panel.tsx)** — Autosaves as you work, folded into checkpoints. View any version and restore it.
- **[Characters and art style](app/components/canvas/elements/asset-strip.tsx)** — Name a character once and every image, voice line, and avatar stays consistent.
- **[Templates](lib/templates/templates.ts)** — POV Life, Sleep Story, True Crime, and more. Each seeds a style, its characters, and a length.
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

You can use OpenSlop two ways:

- **Online** at [app.openslop.ai](https://app.openslop.ai). Nothing to install. It's invite-only for now, so [join the waitlist](https://openslop.ai).
- **Local mode** on your own computer. Follow the steps below.

### Local mode

<p>
  <img src="https://img.shields.io/badge/macOS-Apple%20silicon%20%7C%20Intel-000000?style=for-the-badge&logo=apple&logoColor=white" alt="macOS: Apple silicon and Intel">
  <img src="https://img.shields.io/badge/Windows-10%20%7C%2011-0078D4?style=for-the-badge&logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAgMy40IDkuOCAydjkuNkgwek0xMSAxLjkgMjQgMHYxMS42SDExek0wIDEyLjRoOS44VjIyTDAgMjAuNnpNMTEgMTIuNGgxM1YyNGwtMTMtMS45eiIvPjwvc3ZnPg==" alt="Windows 10 and 11">
  <img src="https://img.shields.io/badge/Linux-x64%20%7C%20arm64-FCC624?style=for-the-badge&logo=linux&logoColor=black" alt="Linux: x64 and arm64">
</p>

Your projects and videos stay on your computer. Only your requests to AI services go online.

<table>
<tr>
<td width="50%" valign="middle">

#### 1. Install Node.js

Go to the [Node.js download page](https://nodejs.org/en/download). Click the green installer button (**Windows Installer** or **macOS Installer**), open the file, and click through. Any version from 22 up works.

</td>
<td width="50%">
  <img src="./assets/features/local-step-node-light.svg#gh-light-mode-only" alt="On nodejs.org, the Windows Installer button is clicked, the installer runs, and Node.js is installed" width="100%">
  <img src="./assets/features/local-step-node-dark.svg#gh-dark-mode-only" alt="On nodejs.org, the Windows Installer button is clicked, the installer runs, and Node.js is installed" width="100%">
</td>
</tr>
<tr>
<td width="50%" valign="middle">

#### 2. Install Docker Desktop (Windows and Intel Macs only)

_Skip this if you're on Linux or on a Mac with an M1 chip or newer (M2, M3 and so on). To check your Mac, open the Apple menu > **About This Mac** and look at **Chip**._

On [docker.com](https://www.docker.com/products/docker-desktop/), click **Download Docker Desktop**, pick your computer, and install it. Open it, and leave it open while you use OpenSlop.

</td>
<td width="50%">
  <img src="./assets/features/local-step-docker-light.svg#gh-light-mode-only" alt="On docker.com, the Windows download is picked from the menu, and Docker Desktop opens with its engine running" width="100%">
  <img src="./assets/features/local-step-docker-dark.svg#gh-dark-mode-only" alt="On docker.com, the Windows download is picked from the menu, and Docker Desktop opens with its engine running" width="100%">
</td>
</tr>
<tr>
<td width="50%" valign="middle">

#### 3. Download OpenSlop

On [OpenSlop's GitHub page](https://github.com/openslop/openslop), click the green **Code** button, then **Download ZIP**. You can also [download the ZIP directly](https://github.com/openslop/openslop/archive/refs/heads/master.zip).

</td>
<td width="50%">
  <img src="./assets/features/local-step-download-light.svg#gh-light-mode-only" alt="On GitHub, the green Code button opens a menu and Download ZIP is clicked" width="100%">
  <img src="./assets/features/local-step-download-dark.svg#gh-dark-mode-only" alt="On GitHub, the green Code button opens a menu and Download ZIP is clicked" width="100%">
</td>
</tr>
<tr>
<td width="50%" valign="middle">

#### 4. Unzip it and start OpenSlop

On Windows, right-click the ZIP > **Extract All**, then right-click the new folder > **Open in Terminal**. On a Mac, double-click the ZIP, then right-click the new folder > **New Terminal at Folder**. In the terminal, run:

```bash
npm install
npm run local
```

The first run takes a few minutes. OpenSlop then opens in your browser, already signed in. To stop it, press Ctrl+C in the terminal. Your projects are saved for next time.

</td>
<td width="50%">
  <img src="./assets/features/local-step-terminal-light.svg#gh-light-mode-only" alt="In the Downloads folder, the ZIP is extracted and opened in Terminal, then npm install and npm run local start OpenSlop" width="100%">
  <img src="./assets/features/local-step-terminal-dark.svg#gh-dark-mode-only" alt="In the Downloads folder, the ZIP is extracted and opened in Terminal, then npm install and npm run local start OpenSlop" width="100%">
</td>
</tr>
<tr>
<td width="50%" valign="middle">

#### 5. Add your AI keys

Click your profile icon, then **Settings** > **Add providers**, and connect a provider with your key. Which keys you need depends on what you make:

- **Everything:** all 7 types: Text, Speech, Images, Videos, Music, Sound and Captions.
- **Faceless voiceover videos:** Text, Speech and Images.
- **Cinematic videos:** Text and Videos.

</td>
<td width="50%">
  <img src="./assets/features/local-step-keys-light.svg#gh-light-mode-only" alt="The profile menu opens Settings, Add providers lists the providers, and an Anthropic key is pasted and connected" width="100%">
  <img src="./assets/features/local-step-keys-dark.svg#gh-dark-mode-only" alt="The profile menu opens Settings, Add providers lists the providers, and an Anthropic key is pasted and connected" width="100%">
</td>
</tr>
</table>

<details>
<summary>What gets downloaded</summary>

- `npm install` gets the app's code.
- The first `npm run local` also downloads, one time:
  - **Supabase**: the database and file storage, kept in `~/.supabase/cache`. On Windows and Intel Macs, it's stored inside Docker Desktop instead.
  - **Chrome Headless Shell**: used for rendering your final videos. Kept in `node_modules/.remotion`.

</details>

### Develop against a Supabase project

#### Prerequisites

- [Node.js](https://nodejs.org) 20.9+ (Next.js 16's minimum; CI runs 22)
- A [Supabase](https://supabase.com) project (for auth and database)

#### Setup

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
| Icons     | In-house masked-SVG set (`components/ui/icon.tsx` + `components/ui/icons/`), no icon dependency              |

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
  script/        Script writing and refinement
  project/       Per-project Zustand store, autosave, persistence
  render/        Scene layout and render client
  templates/     Prompt templates offered in the composer
  upload/        Client-side file upload (image, video, audio)
  supabase/      Browser/server Supabase clients
remotion/        Remotion entry point and compositions
supabase/        Database migrations
```

See [`ARCHITECTURE.md`](ARCHITECTURE.md) for how these layers interact.

## Scripts

| Command                   | What it does                |
| ------------------------- | --------------------------- |
| `npm run dev`             | Start the dev server        |
| `npm run local`           | Run in local mode           |
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
  <a href="https://api.star-history.com/svg?repos=openslop/openslop&type=Date#gh-light-mode-only"><img src="https://api.star-history.com/svg?repos=openslop/openslop&type=Date#gh-light-mode-only" alt="GitHub star history chart for openslop/openslop" width="880"></a>
  <a href="https://api.star-history.com/svg?repos=openslop/openslop&type=Date&theme=dark#gh-dark-mode-only"><img src="https://api.star-history.com/svg?repos=openslop/openslop&type=Date&theme=dark#gh-dark-mode-only" alt="GitHub star history chart for openslop/openslop" width="880"></a>
</p>

## License

Licensed under the [Apache License 2.0](LICENSE).
