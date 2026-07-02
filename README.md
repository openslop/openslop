<div align="center">

# OpenSlop

**Free, open-source AI video creator.**

[![License](https://img.shields.io/badge/license-Apache--2.0-blue?style=for-the-badge)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Discord](https://img.shields.io/badge/Discord-Join-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/zeP5482ced)

<br />

<img src="./assets/openslop-demo.gif" alt="OpenSlop - your free AI video creator" width="100%">

</div>

---

OpenSlop connects all your favorite AI tools into one workflow and helps you create consistent, engaging video content in minutes. No more jumping between ten tabs.

Open-source and free forever.

**Website:** [openslop.ai](https://openslop.ai) | **App:** [app.openslop.ai](https://app.openslop.ai)

## What is this?

OpenSlop is a video creation tool for people who want to make AI-generated content that actually looks good. You bring your AI accounts, OpenSlop brings the workflow.

- Connects to multiple AI providers in one place
- Gives you a real editing workflow, not just a prompt box
- Runs in your browser, no install needed
- Built by engineers from Meta, Google, Stripe, and Dropbox

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 18+
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

3. Create a `.env.local` file with your environment variables:

Required (auth and database):

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Without provider keys, the app falls back to mock providers. To use real ones, add any of:

```
ANTHROPIC_API_KEY=        # LLM
RUNWARE_API_KEY=          # Image + video
ELEVENLABS_API_KEY=       # Music + SFX
CARTESIA_API_KEY=         # Text-to-speech
BLOB_READ_WRITE_TOKEN=    # Vercel Blob (asset storage)
NEXT_PUBLIC_BLOB_URL=     # Vercel Blob public URL
```

4. Run the database migrations:

```bash
npm run db:push
```

5. Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and you should see the app.

## Tech Stack

| Layer     | Tech                                                                                                         |
| --------- | ------------------------------------------------------------------------------------------------------------ |
| Framework | [Next.js 16](https://nextjs.org) (App Router)                                                                |
| Language  | [TypeScript 5](https://www.typescriptlang.org)                                                               |
| UI        | [React 19](https://react.dev), [Tailwind CSS 4](https://tailwindcss.com), [shadcn/ui](https://ui.shadcn.com) |
| Auth + DB | [Supabase](https://supabase.com) (Auth, Postgres, RLS)                                                       |
| Video     | [Remotion 4](https://remotion.dev) (composition, rendering, player)                                          |
| Storage   | [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) (generated asset storage)                         |
| Icons     | [Lucide](https://lucide.dev)                                                                                 |

## Project structure

```
app/             Next.js routes, API endpoints, and editor components
  api/v1/        REST API per asset type (image, video, music, sfx, tts, llm)
  components/    Editor UI (canvas, video preview, etc.)
lib/
  connectors/    Editor-facing client API per asset type
  gateway/       HTTP clients to /api/v1/*
  providers/     Server-side vendor adapters (Runware, ElevenLabs, …)
  generation/    Generation queue and job orchestration
  video/         Remotion compositions and scene layout
  supabase/      Browser/server Supabase clients
remotion/        Remotion entry point
supabase/        Database migrations
```

See [`ARCHITECTURE.md`](ARCHITECTURE.md) for how these layers interact.

## Scripts

| Command                   | What it does                |
| ------------------------- | --------------------------- |
| `npm run dev`             | Start the dev server        |
| `npm run build`           | Production build            |
| `npm run lint`            | ESLint                      |
| `npm run typecheck`       | TypeScript check            |
| `npm run test:run`        | Run tests once (Vitest)     |
| `npm run db:push`         | Push migrations to Supabase |
| `npm run remotion:studio` | Open Remotion Studio        |

## Contributing

Contributions welcome. Fork the repo, make your changes, open a PR.

- Read [`CLAUDE.md`](CLAUDE.md) for the project's coding conventions.
- Read [`ARCHITECTURE.md`](ARCHITECTURE.md) for an end-to-end tour of how
  connectors, gateways, providers, and the generation queue fit together —
  helpful before adding a new asset type or swapping a provider.

## Community

[![Discord](https://img.shields.io/badge/Discord-Join%20the%20community-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/zeP5482ced)

Questions, ideas, or just want to hang out? [Join our Discord](https://discord.gg/zeP5482ced) or [email us](mailto:hi@openslop.ai).

## License

Licensed under the [Apache License 2.0](LICENSE).
