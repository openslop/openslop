<div align="center">

# OpenSlop

**Free, open-source AI video creator.**

[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)
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

Optional (AI provider keys -- without these, the app uses mock providers):

```
ANTHROPIC_API_KEY=        # LLM (Claude)
RUNWARE_API_KEY=          # Image + Video generation
ELEVENLABS_API_KEY=       # Music + SFX generation
CARTESIA_API_KEY=         # Text-to-speech
```

Optional (asset storage -- required when using real providers above):

```
BLOB_READ_WRITE_TOKEN=    # Vercel Blob token for storing generated assets
NEXT_PUBLIC_BLOB_URL=     # Vercel Blob store public URL
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
| Icons     | [Lucide](https://lucide.dev)                                                                                 |

## Project Structure

```
openslop/
|-- app/                    # Next.js App Router pages and layouts
|   |-- api/
|   |   |-- render/         # Remotion video rendering endpoint (SSE progress)
|   |   |-- v1/             # REST API (image, llm, music, sfx, tts, video)
|   |   |-- validate-code/  # Access code validation
|   |-- auth/               # OAuth callback handler
|   |-- components/         # App-specific React components
|   |   |-- canvas/         # Slate-based editor canvas (drag-and-drop, elements, plugins)
|   |   |-- video/          # Video preview, player, and rendering UI
|   |-- login/              # Login page
|   |-- signup/             # Signup page
|   |-- page.tsx            # Home / editor
|   |-- layout.tsx          # Root layout
|-- components/ui/          # shadcn/ui primitives
|-- lib/                    # Shared libraries
|   |-- api/                # Route handler helpers, logger, SSE, response utils
|   |-- clients/            # HTTP client for the OpenSlop API
|   |-- components/         # Shared UI components (Waveform, etc.)
|   |-- config/             # Global connector configuration (React context)
|   |-- connectors/         # Connector abstraction per media type + plugins
|   |-- generation/         # Generation queue and job orchestration
|   |-- providers/          # Provider implementations (Anthropic, ElevenLabs, Cartesia, Runware, etc.)
|   |-- script/             # Script context provider
|   |-- supabase/           # Supabase client helpers (browser, server, middleware)
|   |-- user/               # User context provider
|   |-- video/              # Video layout engine (scene builder, element resolution)
|   |-- utils.ts            # General utilities (cn, etc.)
|-- remotion/               # Remotion video compositions
|-- supabase/migrations/    # Database migrations
|-- proxy.ts                # Auth session refresh + route protection
```

## Scripts

| Command                | What it does                     |
| ---------------------- | -------------------------------- |
| `npm run dev`          | Start the dev server             |
| `npm run build`        | Production build                 |
| `npm run start`        | Start the production server      |
| `npm run lint`         | Run ESLint                       |
| `npm run format:check` | Check formatting (Prettier)      |
| `npm run typecheck`    | Run TypeScript type checks       |
| `npm run test`         | Run tests in watch mode (Vitest) |
| `npm run test:run`     | Run tests once                   |
| `npm run db:push`      | Push migrations to Supabase      |
| `npm run db:migrate`   | Run pending migrations           |
| `npm run db:reset`     | Reset the database               |

## Contributing

Contributions welcome. Fork the repo, make your changes, open a PR.

Please read `CLAUDE.md` for the project's coding conventions before submitting.

## Community

[![Discord](https://img.shields.io/badge/Discord-Join%20the%20community-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/zeP5482ced)

Questions, ideas, or just want to hang out? [Join our Discord](https://discord.gg/zeP5482ced) or [email us](mailto:hi@openslop.ai).

## License

MIT
