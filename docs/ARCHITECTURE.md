# Architecture

![OpenSlop system architecture](./architecture.svg)

> To edit the diagram, open [`architecture.excalidraw`](./architecture.excalidraw) at [excalidraw.com](https://excalidraw.com) (or the VS Code Excalidraw extension), then re-export the SVG to this folder.

## Flows

### 1 · Submit prompt

The prompt/copilot UI hands the prompt to `ScriptProvider`, which calls the LLM connector through the gateway. `POST /api/v1/llm` streams the response back over SSE; the OSML stream parser turns the streamed tags into elements and inserts them into the SlateJS canvas live (scenes containing narration, image, clip, sound, music, and character elements).

### 2 · Generate

**Generate All** collects every element whose inputs changed (stale detection) and schedules jobs on the client `GenerationQueue` — max 2 concurrent slots, with a result cache keyed by inputs so unchanged elements restore instead of regenerating. Each job flows through the per-type connector (+ plugins) and the gateway to `POST /api/v1/{asset}`, which inserts a `pending` row in the `jobs` table and enqueues to the Vercel Queue (`asset-generate` topic). Queue workers process jobs concurrently: call the provider SDK for the element type (llm, image, video, tts, music, sfx — server-side env keys, mock fallback), upload the result files plus a `manifest.json` to Vercel Blob, and mark the job `completed` with the result. Music and sfx generations first check a Pinecone vector-similarity cache (other types may adopt it later). The client polls `GET /api/v1/{type}/{jobId}` until the asset URL comes back and the element preview updates.

### 3 · Save / restore

The project store (metadata, characters, reference images), the canvas script (OSML), and the generation queue's element snapshots are persisted into the `projects` row as JSONB. On load, the same snapshots rehydrate the store, canvas, and queue — generated results survive reloads and builds.

### 4 · Render

**Export Video** calls `POST /api/render`, which fans the composition out across Remotion Lambdas (`renderMediaOnLambda`); chunks render in parallel and the final `video.mp4` lands in S3. The client polls `POST /api/render/progress` for progress and the output URL.

## Gateways

Connectors talk to a swappable gateway slot. Today that's the **OpenSlop gateway** (routes through our `/api/v1/*` endpoints); a **BYOK gateway** will slot in beside it so users can hit providers directly with their own API keys.

## Data

Supabase Postgres with RLS (users only read their own rows; queue workers use the service role):

| Table        | Purpose                                                                     |
| ------------ | --------------------------------------------------------------------------- |
| `auth.users` | Supabase auth users                                                         |
| `projects`   | One row per project — `script`, `store`, and `generation` snapshots (JSONB) |
| `jobs`       | Async generation jobs — `pending → processing → completed \| failed`        |

Generated assets live in Vercel Blob under `assets/{type}/{provider}/{id}/` next to a `manifest.json`, served as public CDN URLs consumed directly by `<img>`, `<audio>`, and `<video>`.
