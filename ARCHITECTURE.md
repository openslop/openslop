# Architecture

A 10k-foot view of how OpenSlop fits together.

![OpenSlop system architecture](./docs/architecture.svg)

> To edit the diagram, open [`docs/architecture.excalidraw`](./docs/architecture.excalidraw) at [excalidraw.com](https://excalidraw.com) (or the VS Code Excalidraw extension), then re-export the SVG to `docs/architecture.svg`.

## Flows

### 1. Submit prompt

The prompt goes through the LLM connector to `POST /api/v1/llm`, which streams OSML back over SSE. The parser inserts elements into the SlateJS canvas as they arrive.

### 2. Generate

Stale elements are queued client-side (bounded by `DEFAULT_BATCH_SIZE`, results cached by inputs) and submitted to `POST /api/v1/{asset}`, which records a `jobs` row and enqueues to the Vercel Queue. Workers call the provider, upload results to Vercel Blob, and mark the job complete. The client polls until the asset URL arrives and the preview updates. Music and sfx check a Pinecone similarity cache first.

### 3. Save / restore

Project state (script, store, and generation snapshots) persists to the `projects` row and rehydrates on load. Generated results survive reloads.

### 4. Render

`POST /api/render` splits the composition across Remotion Lambdas. Chunks render in parallel into an MP4 in S3 while the client polls for progress. Compositions live in `remotion/` and `lib/video/`. The Player is loaded client-side only.

## Three layers

The generation pipeline is split so providers and asset types can be swapped independently:

- **Connectors** (`lib/connectors/`): what the editor calls. Model-agnostic, plugin-pipelined, return an `AssetResult`.
- **Gateways** (`lib/gateway/`): thin HTTP clients between connectors and our `/api/v1/*` routes. This seam lets connectors run against the live API or a mock. Today there is one OpenSlop gateway. A BYOK gateway will be added so users can call providers with their own API keys.
- **Providers** (`lib/providers/`): server-side adapters for vendors (Runware, ElevenLabs, Cartesia, Anthropic). Call the vendor SDK, upload assets, return a bundle response.

## API routes

Every route that takes request data is built from a factory in `lib/api/route-handler.ts` that handles auth, parsing, model validation, and error mapping. One `routeHandler(authTier, parseSource)` builder produces them all, so the factories vary only along those two axes: `createApiRouteHandler` (api-access, JSON body), `createSessionRouteHandler` (session, JSON body), `createApiQueryRouteHandler` (api-access, search params), `createSessionFormRouteHandler` (session, multipart form), `createPublicRouteHandler` (no auth, JSON body), and `createPublicQueryRouteHandler` (no auth, search params). Every handler receives the parsed, validated payload as `input`, whatever the source. Two routes fall outside that shape: `api/queues/asset-generate` is a `@vercel/queue` callback and `auth/callback` is an OAuth redirect. Reusable Zod field schemas live in `lib/api/request-schema-fields.ts`. If a provider's API key isn't set, the route falls back to a mock provider.

## Editor state

- `lib/generation/queue.ts` schedules generation jobs from the editor, caches results per element, and exposes status to the UI. UI dispatches jobs; it never calls connectors directly.
- `lib/project/store.ts` holds per-project metadata in Zustand. Every mutation rule lives in a store action. Components subscribe to reactive state through `useProject(selector)`; `getProjectStore(projectId)` is the escape hatch for imperative access that a render-time selector can't express — non-React callers (connector plugins, queue workers), plus hooks doing one-shot init, `.subscribe`, or reads outside render (`ProjectEditor`, `useAutosave`, `useGenerateAll`).
- `lib/canvas/elementConnector.ts` answers "which connector, provider and model does this element use?" for both the UI and the queue. An element pins its provider when created, so this is also where a pin that no longer resolves falls back to the registry default.
- `lib/script/` provides script context and refinement utilities.
- `app/components/canvas/hooks/useEditorSession.ts` is the one place the Slate editor gets wired to a project: initial hydration, streaming script sync, metadata sync, and autosave. Views call it and render the editor; they never assemble it.

## Data

Supabase Postgres with RLS (users only read their own rows; queue workers use the service role):

| Table        | Purpose                                                                              |
| ------------ | ------------------------------------------------------------------------------------ |
| `auth.users` | Supabase auth users                                                                  |
| `projects`   | One row per project: `script` (text) plus `store` and `generation` snapshots (JSONB) |
| `jobs`       | Async generation jobs: `pending → processing → completed \| failed`                  |

Generated assets live in Vercel Blob under `assets/{type}/{provider}/{id}/`, served as public CDN URLs.

## Auth

- `proxy.ts` (Next.js 16's renamed middleware, keep this name) refreshes the Supabase session on each request.
- API routes have two auth tiers, both defined in `lib/api/with-auth.ts`:
  - `withApiAccess` (`/api/v1/*`): same-origin Supabase session cookie plus the `api_access` grant in `app_metadata` (403 without it).
  - `withSession` (`/api/render*`, `/api/upload/*`): any signed-in user.

## Adding a new asset type

Add a connector + gateway + provider, register the provider in `lib/api/providers.ts`, declare a models map, and add the route under `app/api/v1/<type>`. Tests live in `__tests__` folders next to the code.
