# Architecture

This document explains how OpenSlop is wired together end-to-end. Read it before
adding a new asset type, swapping a third-party API, or hooking a new generation
step into the editor.

## High-level layout

```
Browser (React 19, Slate, Remotion Player)
    │
    │ fetch /api/v1/<type>           (uses lib/clients/openslop)
    ▼
Next.js App Router (app/api/v1/*)    (uses lib/api/route-handler factory)
    │
    │ getXProvider() → BaseProvider  (lib/api/providers.ts)
    ▼
Provider implementation              (lib/providers/<type>/<vendor>.ts)
    │
    │ writes manifest.json + asset   (lib/api/asset-bundle.ts → Vercel Blob)
    ▼
BundleResponse { id, result, … }     (returned to the browser)
```

The browser then drives Remotion (`lib/video/`, `remotion/`) for composition and
preview, and persists project state via Supabase (`lib/supabase/`).

## Three layers of abstraction

The generation pipeline is intentionally split into three layers. Each layer has
a different concern and a different test surface, which is what makes it easy
to swap providers or add new asset types without touching the others.

### 1. `lib/connectors/` — client-facing API

A **connector** is what the editor talks to. Connectors are model-agnostic and
plugin-pipelined: they don't care how an asset gets produced, only that the
caller gets back an `AssetResult` (or `LLMGenerateResult`, etc.).

- `BaseConnector` (`base.ts`) runs the plugin pipeline:
  `transformPrompt → beforeGenerate → _generate → afterGenerate`, with `onError`
  on failure.
- `BaseAssetConnector` (`asset-base.ts`) extends it for asset types and resolves
  a `BundleResponse` to a public URL via `AssetBundle`.
- Per-type bases (`image/connector.ts`, `music/connector.ts`, …) pin
  `type` and `assetKey`.
- `BaseVideoConnector` adds polling for async jobs (`awaitCompletion` in
  `lib/providers/poll.ts`).
- The factory (`factory.ts`) instantiates the right concrete connector from a
  `(ConnectorType, ProviderKey)` pair. `ProviderKey` is currently
  `"openslop"`-only — every connector ultimately calls our own REST API.
- Plugins live in `lib/connectors/plugins/` and can be composed onto any
  connector via `ConnectorConfig.plugins`.

### 2. `lib/gateway/` — HTTP transport

Connectors don't know about HTTP. They delegate to a `GatewayClient` that
wraps `fetch` against `app/api/v1/<type>`. Gateways are thin: they post the
params, surface errors, and return a `BundleResponse`.

This is the seam that lets the same connector code run against the local API
during development, against a hosted API in production, or against a mock in
tests.

### 3. `lib/providers/` — server-side model wrappers

A **provider** is the server-side adapter for a specific vendor (Runware,
ElevenLabs, Cartesia, Anthropic, …). Each provider extends `BaseProvider` and
implements three things:

1. `_generate(params)` — call the vendor SDK, return raw bytes/JSON plus
   `metadata`.
2. `toFiles(result)` — describe the asset files to upload.
3. `blobConfig` — pick the bundle path (`assets/<type>/<provider>/<id>/`).

`BaseProvider.generate()` then handles the upload via `AssetBundle.upload()`
and returns the `BundleResponse` that gateways round-trip back to the
connector.

For audio providers, `lib/providers/elevenlabs.ts` exposes a
`BaseElevenLabsAudio` class that the `music/` and `sfx/` ElevenLabs subclasses
share — they only differ in default duration and which SDK method to call.

## API routes

Every `app/api/v1/<type>/route.ts` is built from the same factory (shown for
the `image` route):

```ts
export const POST = createRouteHandler({
	models: IMAGE_MODELS,
	getProvider: getImageProvider,
	label: "Image generation",
	handle: async (provider, body) => {
		const result = await provider.generate(body);
		return NextResponse.json(result);
	},
});
```

`createRouteHandler` (`lib/api/route-handler.ts`) takes care of:

- JSON parsing
- `prompt` validation
- model slug resolution against the `<type>_MODELS` map
- structured logging on warn/error
- a `serverError` fallback

Add `extraValidation` for type-specific checks (see TTS `voiceId` and Video
`referenceImages` validation).

Providers are resolved through `lib/api/providers.ts`, which uses a
`withMockFallback` helper: if the relevant API key isn't set (e.g.
`RUNWARE_API_KEY`), the route uses the mock provider instead. Provider
instances are cached per process.

## Generation queue

`lib/generation/queue.ts` is the editor's task scheduler. The `GenerationQueue`
class:

- Snapshots inputs (`generationInputs.ts`) so stale results can be detected.
- Enqueues `GenerationJob`s and drains them in batches via
  `generateForElement` → `createConnector(...).generate(...)`.
- Tracks status (`idle | queued | generating`), errors, elapsed seconds, and a
  per-element history of past results for instant cache hits when inputs match.
- Exposes a Zustand-style subscribe API used by canvas elements to render
  progress.

The queue is the single point that wires connectors into the React app — UI
components dispatch jobs, never call connectors directly.

## Project & script state

- `lib/project/store.ts` holds per-project metadata (characters, defaults) in a
  Zustand store, scoped by project id.
- `lib/script/` provides a React context for the current script being edited.
- `lib/config/` stores connector configuration globally; per-element
  configuration overlays this.

## Auth & request lifecycle

- `proxy.ts` is the Next.js 16 proxy entry (renamed upstream from
  `middleware.ts` — **do not rename it back**).
- It calls `updateSession()` from `lib/supabase/middleware.ts`, which refreshes
  the Supabase session cookie on every non-static request.
- Browser-side Supabase access goes through `lib/supabase/client.ts`;
  server-side via `lib/supabase/server.ts`.

## Video rendering

- Compositions live in `remotion/` and `lib/video/`.
- `app/api/render/route.ts` invokes Remotion's render pipeline; the bundle is
  produced via `npm run remotion:bundle` or on-demand.
- `app/components/video/VideoPreview.tsx` is a Client Component that
  `next/dynamic`-imports the Remotion Player with `ssr: false` (this is the
  only sanctioned use of `ssr: false` — see CLAUDE.md).

## Adding a new asset type

If you need to introduce, say, "captions" as a first-class asset:

1. Add `CaptionsGenerateParams` and `CaptionsConnector` to
   `lib/connectors/types.ts`, plus an entry in `ConnectorTypeMap`.
2. Create `lib/connectors/captions/connector.ts` (a `BaseCaptionsConnector`
   extending `BaseAssetConnector`) and a `captions/openslop/index.ts`
   implementation that wires up a gateway.
3. Add a `lib/gateway/openslop/captions.ts` gateway client.
4. Implement one or more providers in `lib/providers/captions/<vendor>.ts`
   extending `BaseProvider`.
5. Register the provider in `lib/api/providers.ts` (`getCaptionsProvider`).
6. Add `CAPTIONS_MODELS` and `app/api/v1/captions/route.ts` using
   `createRouteHandler`.
7. Wire the connector into `lib/connectors/factory.ts`.

Tests for each layer live in `__tests__` folders next to the code they cover.
