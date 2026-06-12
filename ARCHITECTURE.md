# Architecture

A 10k-foot view of how OpenSlop fits together.

![OpenSlop system architecture](./docs/architecture.svg)

> To edit the diagram, open [`docs/architecture.excalidraw`](./docs/architecture.excalidraw) at [excalidraw.com](https://excalidraw.com) (or the VS Code Excalidraw extension), then re-export the SVG to `docs/architecture.svg`.

## Flows

### 1 · Submit prompt

The prompt/copilot UI hands the prompt to `ScriptProvider`, which calls the LLM connector through the gateway. `POST /api/v1/llm` streams the response back over SSE; the OSML stream parser turns the streamed tags into elements and inserts them into the SlateJS canvas live (scenes containing narration, image, clip, sound, music, and character elements).

### 2 · Generate

**Generate All** collects every element whose inputs changed (stale detection) and schedules jobs on the client `GenerationQueue` — bounded concurrency (`DEFAULT_BATCH_SIZE` in `lib/generation/queue.ts`, currently 2), with a result cache keyed by inputs so unchanged elements restore instead of regenerating. Each job flows through the per-type connector (+ plugins) and the gateway to `POST /api/v1/{asset}`, which inserts a `pending` row in the `jobs` table and enqueues to the Vercel Queue (`asset-generate` topic). Queue workers process jobs concurrently: call the provider for the element type, upload the result files plus a `manifest.json` to Vercel Blob, and mark the job `completed` with the result. Music and sfx generations first check a Pinecone vector-similarity cache (other types may adopt it later). The client polls `GET /api/v1/{type}/{jobId}` until the asset URL comes back and the element preview updates.

### 3 · Save / restore

The project store (metadata, characters, reference images) and the generation queue's element snapshots are persisted into the `projects` row as JSONB, alongside the canvas script (OSML) as text. On load, the same snapshots rehydrate the store, canvas, and queue — generated results survive reloads and builds.

### 4 · Render

**Export Video** calls `POST /api/render`, which fans the composition out across Remotion Lambdas (`renderMediaOnLambda`); chunks render in parallel and the final `video.mp4` lands in S3. The client polls `POST /api/render/progress` for progress and the output URL. Compositions live in `remotion/` and `lib/video/`; the Player is loaded client-side only.

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

Generated assets live in Vercel Blob under `assets/{type}/{provider}/{id}/` next to a `manifest.json`, served as public CDN URLs consumed directly by `<img>`, `<audio>`, and `<video>`.

## Auth

- `proxy.ts` (Next.js 16's renamed middleware — keep this name) refreshes the Supabase session on each request.
- `/api/v1/*` is same-origin only and authenticates via the Supabase session cookie.

## Adding a new asset type

Add a connector + gateway + provider, register the provider in `lib/api/providers.ts`, declare a models map, and add the route under `app/api/v1/<type>`. Tests live in `__tests__` folders next to the code.
