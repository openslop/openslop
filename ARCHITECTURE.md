# Architecture

A 10k-foot view of how OpenSlop fits together.

## Request flow

```
Browser (React, Slate, Remotion)
    ↓ fetch /api/v1/<type>
Next.js route (app/api/v1/*)
    ↓
Provider (vendor adapter)
    ↓ uploads to Vercel Blob
Response → browser
```

The browser drives Remotion for preview and persists project state via Supabase.

## Three layers

The generation pipeline is split so providers and asset types can be swapped independently:

- **Connectors** (`lib/connectors/`) — what the editor calls. Model-agnostic, plugin-pipelined, return an `AssetResult`.
- **Gateways** (`lib/gateway/`) — thin HTTP clients between connectors and our own `/api/v1/*` routes. The seam that lets connectors run against either the live API or a mock.
- **Providers** (`lib/providers/`) — server-side adapters for vendors (Runware, ElevenLabs, Cartesia, Anthropic). Call the vendor SDK, upload assets, return a bundle response.

## API routes

Every `app/api/v1/<type>/route.ts` is built from a shared `createRouteHandler` factory that handles auth, parsing, model validation, and error mapping. Reusable Zod field schemas live in `lib/api/request-schema-fields.ts`. If a provider's API key isn't set, the route falls back to a mock provider.

## Editor state

- `lib/generation/queue.ts` schedules generation jobs from the editor, caches results per element, and exposes status to the UI. UI dispatches jobs; it never calls connectors directly.
  - Public queue interface is intentionally narrow: `enqueue/enqueueAll`, `cancel/cancelAll/discard`, `restoreResult`, and read-only snapshot selectors (`getElementSnapshot`, `getResultVersion`, `isBusy`, `getActiveCount`, `getPeakActive`).
  - Queue internals keep orchestration concerns private (timers, active controllers, pending list, and cache/history maps) so UI components consume state instead of implementation details.
- `lib/project/store.ts` holds per-project metadata in Zustand.
- `lib/script/` provides script context and refinement utilities.

## Auth

- `proxy.ts` (Next.js 16's renamed middleware — keep this name) refreshes the Supabase session on each request.
- `/api/v1/*` is same-origin only and authenticates via the Supabase session cookie.

## Video rendering

Compositions live in `remotion/` and `lib/video/`. `app/api/render/route.ts` drives Remotion's render pipeline. The Player is loaded client-side only.

## Adding a new asset type

Add a connector + gateway + provider, register the provider in `lib/api/providers.ts`, declare a models map, and add the route under `app/api/v1/<type>`. Tests live in `__tests__` folders next to the code.
