# Architecture

A 10k-foot view of how OpenSlop fits together.

![OpenSlop system architecture](./docs/architecture.svg)

> To edit the diagram, open [`docs/architecture.excalidraw`](./docs/architecture.excalidraw) at [excalidraw.com](https://excalidraw.com), then re-export the SVG to `docs/architecture.svg`.

## Flows

1. **Write.** A prompt goes to the LLM route, which streams OSML back. The parser inserts elements into the Slate canvas as they arrive, usually through Sloppy.
2. **Generate.** An element resolves into a small dependency graph. The client queues stale nodes, dependencies first, and posts each to an asset route, which records a `jobs` row and enqueues it on the Vercel Queue. A worker hands the job to its type's handler, uploads the result to Vercel Blob, and the client polls until the asset arrives. Video outlives one delivery, so its job redelivers itself to poll the vendor.
3. **Save.** The script, the store and the generation snapshots persist to the `projects` row, with autosaved history in `canvas_versions`.
4. **Render.** The composition splits across Remotion Lambdas that render chunks in parallel into an MP4 in S3.

## Sloppy

The conversational agent in the editor's left panel. A turn is a ReAct loop over the agent route: the server streams text and tool calls, the client runs each tool against the Slate editor and posts the result back, until the model answers in text. The agent never writes the project itself, so the client stays the single writer. `lib/agent/` is the domain, `lib/api/agentTurn.ts` runs a turn, `app/components/sloppy/` is the panel.

## Vocabulary

Users see models and providers; developers also see connectors. Each word means one thing everywhere.

- **Model**: what an element generates with, a `{ provider, model }` pair such as Claude Opus 5 on Anthropic.
- **Provider**: the vendor serving a model (Anthropic, Runware, ElevenLabs, Cartesia, or OpenSlop's hosted gateway). A user connects one by storing a key.
- **Provider key**: the stored credential, one row per user and provider in `provider_keys`, held in Vault.
- **Connector** (internal only): the seam between a canvas element and its model. It owns which attributes an element exposes for a given model and relays them through a gateway as a generation request.

## Three layers

- **Connectors** (`lib/connectors/`): what the editor calls. One class per media type, plugin-pipelined, serving every provider of that type.
- **Gateways** (`lib/gateway/`): thin HTTP clients from connectors to our own routes. The provider a model names picks the route family: `/api/v1` for models OpenSlop hosts, `/api/third-party` for models a user brings a key for.
- **Providers** (`lib/providers/`): server-side vendor adapters (Runware, ElevenLabs, Cartesia, Anthropic). The same classes serve both families; only where the key comes from differs.

## Models and provider keys

A model is a `{ provider, model }` pair, never a bare name. `MODELS[type][provider][name]` in `lib/connectors/models.ts` is the whole table, and nothing anywhere derives a provider from a name. Every element stores its own pair as attributes, speech included. A voice in project metadata stores the pair its voice id was found on; a narration or character element on any other pair searches for a voice afresh, and the id it finds is remembered on that pair. Defaults resolve element, then project, then account, then the recommendation.

Everything that differs between the two route families is one object each in `lib/api/route-families.ts`. `HOSTED` is API-access gated, takes only a model name, and runs on our keys. `BYOK` is session gated, takes the pair, and runs on the account's key. A route file picks a family and the models it serves. A job stores the pair, and the worker builds the provider from it at the last moment, which is the one place the server branches on the family.

User keys live in Supabase Vault, one per provider, read by the service role for the single request about to use them and never returned to a client. A key is verified by asking the vendor.

## Generation graph

A generation is a graph, not a lone job (`lib/generation/`). A node is one unit of generation with its inputs and its edges. A source node stands for project state that is read rather than generated, such as a character's voice. Edges come from connector plugins declaring what they read, so one declaration drives what a job waits for and what makes it stale. A node regenerates when it has no result, when a dependency does, or when its inputs changed since its result was made. The queue runs the graph dependencies first under a per-media-type concurrency limit.

## Editor state

- `lib/project/` holds per-project metadata in a Zustand store and owns saving, version history and the project document as one unit.
- `lib/canvas/` owns the Slate document: element types, insertion, attribute schemas, and which connector and model an element generates with.
- `app/components/canvas/` wires one editor session to a project and renders it. The UI dispatches generation nodes and never calls connectors directly.

## Data

Supabase Postgres with row-level security. Queue workers use the service role.

| Table             | Purpose                                                             |
| ----------------- | ------------------------------------------------------------------- |
| `projects`        | Script plus store and generation snapshots                          |
| `canvas_versions` | Autosaved history of those columns                                  |
| `jobs`            | Async generation jobs: `pending → processing → completed \| failed` |
| `provider_keys`   | One row per user and provider: vault id, last four, status          |
| `conversations`   | One Sloppy conversation per project                                 |
| `messages`        | Its turns                                                           |

Generated assets live in Vercel Blob as public CDN URLs.

## Auth

`proxy.ts` refreshes the Supabase session on each request. Routes have two tiers: `withApiAccess` for `/api/v1/*` (session plus the `api_access` grant) and `withSession` for everything else a signed-in user may do, including BYOK routes.

## Adding a provider or asset type

A hosted model is a row in its type's `openslop/models.ts` plus a row naming its class in `lib/api/providers/openslop.ts`. A BYOK provider is a brand entry in the provider catalog, a models map under `lib/connectors/<type>/<provider>/`, a class per type in the vendor table, and a `validate()` on those classes. A new asset type is a connector, a provider, a models map and two route files. Tests live in `__tests__` folders next to the code.
