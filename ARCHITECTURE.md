# Architecture

A 10k-foot view of how OpenSlop fits together.

![OpenSlop system architecture](./docs/architecture.svg)

> To edit the diagram, open [`docs/architecture.excalidraw`](./docs/architecture.excalidraw) at [excalidraw.com](https://excalidraw.com) (or the VS Code Excalidraw extension), then re-export the SVG to `docs/architecture.svg`.

## Flows

### 1. Submit prompt

The prompt goes through the LLM connector to `POST /api/v1/llm`, which streams OSML back over SSE. The parser inserts elements into the SlateJS canvas as they arrive via Sloppy (see [Sloppy](#sloppy)).

### 2. Generate

Generate resolves the element into a dependency graph (see [Generation graph](#generation-graph)) and queues the stale nodes client-side, dependencies first and up to a per-media-type concurrency limit at a time. Each job is submitted to `POST /api/v1/{asset}`, which records a `jobs` row and enqueues to the Vercel Queue. The client polls until the asset URL arrives and the preview updates. Music and sfx check a Pinecone similarity cache first.

Each delivery runs `lib/api/process-job.ts`, which hands the job to the `JobHandler` registered for its type (`lib/api/job-handlers.ts`) and gets back `completed` or `pending`. Image, tts, music and sfx complete on the first delivery. Video is slow enough to outlive one invocation, so its handler submits to the provider, records the provider's job id on the row, and reports `pending`; the job then redelivers itself every 5s to poll, and fails once it outlives `JOB_TIMEOUT_MS`. Results upload to Vercel Blob. Bytes a provider only exposes at its own URL are streamed across rather than linked, so every asset we serve is our own.

### 3. Save / restore

Project state (script, store, and generation snapshots) persists to the `projects` row and rehydrates on load. Generated results survive reloads.

### 4. Render

`POST /api/render` splits the composition across Remotion Lambdas. Chunks render in parallel into an MP4 in S3 while the client polls for progress. Compositions live in `remotion/` and `lib/video/`. The Player is loaded client-side only.

## Sloppy

Sloppy is the conversational agent in the editor's left panel. A turn is a ReAct loop over `POST /api/v1/agent`: each request loads the transcript, appends the project's settings snapshot to the system prompt, and streams reasoning, text and tool calls back as a UI-message stream. The script itself is never in the prompt; the agent reads it through `read_script`.

Tools are declared without an executor, so a step stops at the call. The client runs it against the Slate editor and posts the result back to the same route, which invokes the model again, until the model answers in text or `MAX_TOOL_CALLS` withdraws the tools and forces an answer. The agent never writes `projects.script` or `projects.store` itself, so the client stays the single writer and autosave stays the single persistence path.

Turns are stored as the SDK's UI message type, so the stream, the rows and the panel share one shape and nothing is converted between them. `lib/agent/` holds the domain (one self-contained definition file per tool and their registry, the context block, message helpers, prompt), `lib/api/agentTurn.ts` runs the turn, and `app/components/sloppy/` is the panel, which reads everything it shows back from rows.

## Three layers

The generation pipeline is split so providers and asset types can be swapped independently:

- **Connectors** (`lib/connectors/`): what the editor calls. Model-agnostic, plugin-pipelined, return an `AssetResult`. One class per type (`lib/connectors/<type>/connector.ts`) serves every provider of that type, since plugins are what the type does, not what one vendor does. `DEFAULT_CONNECTOR_REGISTRY` declares each type's static plugin chain; `ConfigProvider` appends only the chains that need a live project store.
- **Gateways** (`lib/gateway/`): thin HTTP clients between connectors and our own routes. `HttpAssetGateway` / `HttpLLMGateway` / `HttpTTSGateway` (`lib/gateway/http.ts`) hold the protocol. Every route family speaks it, so a family is only a prefix: `apiPrefixFor` (`lib/gateway/prefix.ts`) sends the hosted provider to `/api/v1/*` and everyone else to `/api/third-party/*`, and a gateway is built with the provider its config names.
- **Providers** (`lib/providers/`): server-side adapters for vendors (Runware, ElevenLabs, Cartesia, Anthropic). Call the vendor SDK, upload assets, return a bundle response. The same classes serve both gateway families; only where the key comes from differs. `lib/api/providers.ts` is the one place a vendor is chosen: the `VENDORS` table lists each vendor's class per connector type, and `providerFor` returns the hosted provider or the vendor's own class built with the caller's key. LLM providers go through the Vercel AI SDK, and the provider's `agentModel()` builds the `LanguageModel` and maps vendor-specific knobs like reasoning effort.

## BYOK

A model name is the whole routing decision. `ModelCatalog` (`lib/connectors/modelCatalog.ts`) maps each name to the provider serving it and the id that provider's API takes, so `providerForModel` decides the connector, the gateway family, and whose key runs the generation — nothing stores a provider separately.

- **Which model.** `defaultModelFor` resolves element override → project default (`metadata.connectorModels`) → account default (`user_metadata.connectorModels`) → the catalog's recommendation, and `modelSourceFor` names the scope that supplied it, which is what the provenance tooltips read.
- **Keys.** Stored per user in `connectors`, one row per provider. A key is checked by asking the vendor: every class in `VENDORS` implements `validate()` (`lib/providers/validate.ts`), shared across a vendor's types by its own base or module — `BaseElevenLabsAudio` for Music and SFX, `validateRunwareKey` for Image and Video — so `validateKey` takes any of a vendor's classes and asks it. `verifyConnector` records the verdict on the row. The key itself lives in Supabase Vault; the row keeps only the last four characters and the last verification result. Reads and writes go through `security definer` functions that only the service role may execute (`lib/api/connectorKeys.ts`), so a key is decrypted on the server, for the one request about to use it, and is never returned to a client.
- **Routes.** `/api/third-party/*` mirrors `/api/v1/*` but is session-authenticated rather than api-access gated, and derives the provider from the model instead of accepting one. Asset generation creates the same `jobs` row, so polling, timeouts, cancel and history are unchanged.
- **When the name becomes an id.** A request keeps the model's _name_ all the way to the code that reaches a vendor, because the name is what says which provider serves it. The synchronous text routes translate as they call (`lib/api/llm-routes.ts`, one factory per family); an asset job stores the name, and the queue worker resolves both the provider and the vendor's id from it (`providerRequest` / `vendorParams`). Translating at the HTTP boundary instead would throw the routing away — two models can share a vendor id (`Slop Image v1` _is_ `Seedream 5 Lite`, on our key rather than yours), so the id alone can never say whose key to read.

## API routes

Every route that takes request data is built from a factory in `lib/api/route-handler.ts` that handles auth, parsing, model validation, and error mapping. One `routeHandler(authTier, parseSource)` builder produces them all, so the factories vary only along those two axes: `createApiRouteHandler` (api-access, JSON body), `createSessionRouteHandler` (session, JSON body), `createApiQueryRouteHandler` (api-access, search params), `createSessionFormRouteHandler` (session, multipart form), `createPublicRouteHandler` (no auth, JSON body), and `createPublicQueryRouteHandler` (no auth, search params). Every handler receives the parsed, validated payload as `input`, whatever the source. Two routes fall outside that shape: `api/queues/asset-generate` is a `@vercel/queue` callback and `auth/callback` is an OAuth redirect. Reusable Zod field schemas live in `lib/api/request-schema-fields.ts`. If a provider's API key isn't set, the route falls back to a mock provider.

## Generation graph

A generation is a small dependency graph, not a lone job. `lib/generation/graph.ts` defines it:

- A **node** is one unit of generation, keyed by element id, holding `inputs` (the authored prompt plus non-layout attributes) and `dependsOn` edges.
- A **source node** stands for project state that is read rather than generated: art style, reference images, aspect ratio, a character's voice (`sourceNodes.ts`). It has no job, and its identity is its own inputs.
- Edges come from the plugin chain. A connector plugin declares `dependencies(element)`, so one declaration drives what a job reads, what it waits for, and what makes it stale.

`resolveGraph.ts` turns a `NodeSpec` such as `forElement(element)` into the built node and everything under it, resolving each element's connector and deduping nodes shared within the call. `useNodeBuilder` supplies the connector registry and a project-state snapshot, and rebuilds on any store write.

Staleness falls out of the graph: a node needs generating when it has no result, when a dependency does, or when its current inputs differ from the inputs its result was made from. One element (`useGenerate`) and Generate All (`useGenerateAll`) run the same check. A result the user supplied is `pinned` and never regenerated.

`queue.ts` runs the graph. It flattens roots dependencies-first, skips nodes that are already fresh, and holds only what is in flight: the pending nodes and the jobs currently running, each with its abort controller. Everything that outlives a run lives beside it:

- `snapshots.ts` is the per-element record (status, elapsed seconds, result, error, the inputs that result was made from) plus a result history keyed by serialized inputs, so undoing an edit restores the earlier result instead of regenerating it. It is also the subscription observers read through; mutators leave notifying to the caller so a batch of edits lands as one update.
- `elapsedTicker.ts` counts whole seconds for running jobs and keeps its interval alive only while something is running.
- `concurrency.ts` is how many jobs of each media type may run at once, so a pair of slow videos never stalls the sound effects behind them. The limits are hardcoded until BYOK makes them a user setting.

## Editor state

- `lib/generation/` decides what to generate and runs it, as above. The UI dispatches nodes; it never calls connectors directly.
- `lib/project/store.ts` holds per-project metadata in Zustand. Every mutation rule lives in a store action. `ProjectEditor` creates the store and `ProjectStoreProvider` supplies it; components subscribe through `useProject(selector)`, and code that can't express itself as a render-time selector (one-shot init, `.subscribe`, reads outside render) takes the handle from `useProjectStoreHandle()`. A plugin never reaches for the store to read: it is handed the state snapshot its caller resolved inputs against, as `ctx.state`. `voice-hydrate` is the one plugin holding a store handle, because it writes.
- `MetadataSchema` (`lib/project/types.ts`) is where a metadata default lives, not the reader. `videoSettings` in particular is total once parsed — `VideoSettingsSchema` fills every knob — so the aspect ratio, transition, length, and caption settings are read straight off the store (`useVideoSetting`) with no fallback in sight, and written back through `useUpdateVideoSettings` rather than a hand-assembled metadata patch.
- `lib/canvas/elementConnector.ts` answers "which connector, provider and model does this element use?" for both the UI and the queue. An element pins its provider when created, so this is also where a pin that no longer resolves falls back to the registry default.
- `lib/script/` provides script context and refinement utilities.
- `app/components/canvas/hooks/useEditorSession.ts` is the one place the Slate editor gets wired to a project: initial hydration, streaming script sync, metadata sync, autosave and version history. `CanvasProviders` opens the session and composes every canvas-scoped provider around it, as a flat list through `composeProviders`; views render the editor and never assemble it.
- The editor instance is never a prop. `CanvasProviders` puts it straight into `<Slate>`, and everything below reaches it with `useSlateStatic()`.
- Where the player sits is one value, not a position plus a visible flag: `PlayerPlacementContext` holds `"top" | "right" | "hidden"`, so "hidden but on the right" cannot be represented. Hiding keeps the preferred side so `showPlayer()` restores it, and a narrow viewport forces `top`.
- What sits under the transport bar is one registry: `app/components/video/bottomViews.tsx` carries each view's label, icon, panel and whether it fills the dock, and the `BottomView` union is its keys. `BottomDock` renders its own panel, so adding a view is one entry and nothing else.
- Selecting a scene is one rule: `useSelectScene()` marks it active, scrolls the canvas to it, and seeks the player to its start. The timeline and the storyboard both go through it, so neither can drift on clamping or on silencing media mid-seek.
- `lib/project/projectDocument.ts` is the live project as one readable, writable unit (script, store snapshot, generation snapshot), so a version is never half applied. `canvasHistory.ts` is the state machine over it: saves fold into the newest version for `FOLD_WINDOW_MS`, previewing stashes the live content and suspends autosave, and restoring adopts whatever is on screen.
- `lib/project/autosave.ts` owns saving: it builds the row from the store snapshot, script and generation snapshot, then debounces and serializes writes so a slow save can't land after a newer one. `useAutosave` only subscribes the editor value, the store, and the queue to it, and turns the result into a toast.

## Data

Supabase Postgres with RLS (users only read their own rows; queue workers use the service role):

| Table             | Purpose                                                                                 |
| ----------------- | --------------------------------------------------------------------------------------- |
| `auth.users`      | Supabase auth users                                                                     |
| `projects`        | One row per project: `script` (text) plus `store` and `generation` snapshots (JSONB)    |
| `canvas_versions` | Autosaved history of those same three columns, one row per folded checkpoint            |
| `jobs`            | Async generation jobs: `pending → processing → completed \| failed`                     |
| `connectors`      | One row per user + provider: vault secret id, last four characters, verification status |
| `conversations`   | One Sloppy conversation per project                                                     |
| `messages`        | Its turns: `parts` (text / reasoning / tool-call / tool-result) plus usage              |

Generated assets live in Vercel Blob under `assets/{type}/{provider}/{id}/`, served as public CDN URLs.

## Auth

- `proxy.ts` (Next.js 16's renamed middleware, keep this name) refreshes the Supabase session on each request.
- API routes have two auth tiers, both defined in `lib/api/with-auth.ts`:
  - `withApiAccess` (`/api/v1/*`): same-origin Supabase session cookie plus the `api_access` grant in `app_metadata` (403 without it).
  - `withSession` (`/api/render*`, `/api/upload/*`, `/api/connectors*`, `/api/third-party/*`): any signed-in user. BYOK runs on the user's own key, so it is not gated on our API grant.

## Adding a new asset type

Add a connector (`lib/connectors/<type>/connector.ts`) + provider, register the provider in `lib/api/providers.ts`, declare a models map, and add the route under `app/api/v1/<type>`. To add a BYOK provider instead, give it a brand entry in `PROVIDER_CATALOG`, a models map under `lib/connectors/<type>/<provider>/models.ts` folded into that type's catalog, an entry in `VENDORS` naming its class per type, and a `validate()` on those classes saying how the vendor answers for a key; the factory, the registry, the route schemas, and what the settings browser says it can do are all derived from the catalog. Tests live in `__tests__` folders next to the code.
