# Architecture

A 10k-foot view of how OpenSlop fits together.

![OpenSlop system architecture](./docs/architecture.svg)

> To edit the diagram, open [`docs/architecture.excalidraw`](./docs/architecture.excalidraw) at [excalidraw.com](https://excalidraw.com) (or the VS Code Excalidraw extension), then re-export the SVG to `docs/architecture.svg`.

## Flows

### 1 · Submit prompt

The prompt goes through the LLM connector to `POST /api/v1/llm`, which streams OSML back over SSE; the parser inserts elements into the SlateJS canvas as they arrive.

### 2 · Generate

Stale elements are queued client-side (bounded by `DEFAULT_BATCH_SIZE`, results cached by inputs) and submitted to `POST /api/v1/{asset}`, which records a `jobs` row and enqueues to the Vercel Queue. Workers call the provider, upload results to Vercel Blob, and mark the job complete; the client polls until the asset URL lands in the element preview. Music and sfx check a Pinecone similarity cache first.

### 3 · Save / restore

Project state — script, store, and generation snapshots — persists into the `projects` row and rehydrates on load, so generated results survive reloads.

### 4 · Render

`POST /api/render` fans the composition out across Remotion Lambdas; chunks render in parallel into an MP4 in S3 while the client polls for progress. Compositions live in `remotion/` and `lib/video/`; the Player is loaded client-side only.

## Three layers

The generation pipeline is split so providers and asset types can be swapped independently:

- **Connectors** (`lib/connectors/`) — what the editor calls. Model-agnostic, plugin-pipelined, return an `AssetResult`.
- **Gateways** (`lib/gateway/`) — thin HTTP clients between connectors and our own `/api/v1/*` routes. The seam that lets connectors run against either the live API or a mock. Today there's the **OpenSlop gateway**; a **BYOK gateway** will slot in beside it so users can hit providers directly with their own API keys.
- **Providers** (`lib/providers/`) — server-side adapters for vendors (Runware, ElevenLabs, Cartesia, Anthropic). Call the vendor SDK, upload assets, return a bundle response.

## API routes

Every `app/api/v1/<type>/route.ts` is built from a shared `createRouteHandler` factory that handles auth, parsing, model validation, and error mapping. Reusable Zod field schemas live in `lib/api/request-schema-fields.ts`. If a provider's API key isn't set, the route falls back to a mock provider.

## Editor state

- `lib/generation/queue.ts` schedules generation jobs from the editor, caches results per element, and exposes status to the UI. UI dispatches jobs; it never calls connectors directly.
- `lib/project/store.ts` holds per-project metadata in Zustand.
- `lib/script/` provides script context and refinement utilities.

## Data

Supabase Postgres with RLS (users only read their own rows; queue workers use the service role):

| Table        | Purpose                                                                               |
| ------------ | ------------------------------------------------------------------------------------- |
| `auth.users` | Supabase auth users                                                                   |
| `projects`   | One row per project — `script` (text) plus `store` and `generation` snapshots (JSONB) |
| `jobs`       | Async generation jobs — `pending → processing → completed \| failed`                  |

Generated assets live in Vercel Blob under `assets/{type}/{provider}/{id}/`, served as public CDN URLs.

## Auth

- `proxy.ts` (Next.js 16's renamed middleware — keep this name) refreshes the Supabase session on each request.
- `/api/v1/*` is same-origin only and authenticates via the Supabase session cookie.

## Adding a new asset type

Add a connector + gateway + provider, register the provider in `lib/api/providers.ts`, declare a models map, and add the route under `app/api/v1/<type>`. Tests live in `__tests__` folders next to the code.
