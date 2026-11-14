# Architecture

OpenSlop aims to be an expert generative AI agent that combines any models, from video, image and voice to music, sound and 3D, into whatever the user imagines, from a single shot to a film, a podcast or an explainer.

<p align="center">
  <img src="./docs/architecture-light.svg#gh-light-mode-only" alt="OpenSlop system architecture" width="100%">
  <img src="./docs/architecture-dark.svg#gh-dark-mode-only" alt="OpenSlop system architecture" width="100%">
</p>

> The diagrams are Excalidraw files in [`docs/`](./docs). Edit one at [excalidraw.com](https://excalidraw.com), re-export it as `<name>-light.svg`, then run `npm run diagrams:dark` to regenerate the dark version.

The project lives in the browser as one document. The server stays thin: it proxies models, runs generation jobs, renders and saves.

## Flows

The numbers match the diagram.

1. **Write.** Sloppy, or the user, writes the script into the canvas.
2. **Generate.** The client queues stale elements; the server runs each as a job and stores the result in Vercel Blob.
3. **Save.** The canvas, project store and snapshots save to one `projects` row, with autosaved history in `canvas_versions`.
4. **Render.** The canvas and its results lay out into one Remotion timeline. The Player previews it in the browser; Lambdas render it in parallel chunks to an MP4 in S3.

## Canvas and generation

<p align="center">
  <img src="./docs/canvas-model-light.svg#gh-light-mode-only" alt="The canvas model: what block, node, element, scene, content and asset mean, and how they nest" width="100%">
  <img src="./docs/canvas-model-dark.svg#gh-dark-mode-only" alt="The canvas model: what block, node, element, scene, content and asset mean, and how they nest" width="100%">
</p>

The canvas is the project. Each term means one thing everywhere in the code:

| Term                      | Where                               | Means                                                                                                                                                              |
| ------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Canvas**                | `lib/canvas/`                       | The Slate document, and the project itself. Sloppy and the user edit the same one.                                                                                 |
| **OSML**                  | `osml-serializer.ts`                | OpenSlop Markup Language: the tag format the canvas saves as and the LLM writes, so a model's output streams straight onto the canvas.                             |
| **Node**                  | Slate `Node`                        | Any Slate node: the editor, a block or a text leaf. Not a graph node.                                                                                              |
| **Block**                 | `CanvasBlock`                       | A scene or an element.                                                                                                                                             |
| **Scene**                 | `Scene`                             | An ordered group of content. A block, not an element.                                                                                                              |
| **Element**               | `CanvasElement`                     | Prompt text plus attributes. Its type is declared once in `ELEMENT_TYPES`.                                                                                         |
| **Content**               | `ContentElement`                    | An element inside a scene that plays on the timeline: narration, character, image, video, sound, music. Its role and layer place it in the mix.                    |
| **Asset**                 | `AssetElement`                      | An element ahead of the scenes, named `asset_*`, known by type and name. Content uses it by reference, so a character looks and sounds the same everywhere.        |
| **Character**             | `asset_avatar` + `asset_voice`      | An avatar and/or voice sharing a name. The narrator is the voice named Narrator.                                                                                   |
| **Generated**             | `GeneratedElement`                  | An element whose type names a connector: every content type, the avatar and the voice.                                                                             |
| **Metadata**              | `asset_style`, `asset_references`   | An asset with no connector. Plugins read it; it never generates.                                                                                                   |
| **Media draft**           | `asset_media_<type>`                | A Media panel prompt. It generates like the content type it drafts, outside the script.                                                                            |
| **Generation attributes** | `generationAttributes`              | What a model makes: model, duration, voice. A change makes the element stale.                                                                                      |
| **Layout attributes**     | `LAYOUT_ATTRIBUTE_KEYS`             | How a result plays: volume, loop, trim, motion. A change never costs a regeneration.                                                                               |
| **Connector**             | `lib/connectors/`                   | Turns an element into a generation request, one per media type: LLM, image, video, TTS, voice, STT, music, sound.                                                  |
| **Plugin**                | `lib/connectors/registry.ts`        | Per-type behaviour: extra dependencies (a shot uses its characters' avatars), metadata reads (art style, references), prompt hooks. No special cases in the graph. |
| **Graph node**            | `GenerationNode`, `lib/generation/` | One per generated element: its inputs and edges to the elements it uses.                                                                                           |
| **Stale**                 | `staleness.ts`                      | A node with no result, a regenerated dependency or changed inputs. The stale reason names what changed.                                                            |
| **Queue**                 | `GenerationQueue`                   | Runs stale nodes, dependencies first, a few per media type at a time. It rebuilds each node from the live canvas when its job starts.                              |
| **Snapshot store**        | `SnapshotStore`                     | Each element's status, result and error, keyed by element id. Apart from the canvas, so typing never churns results and results never rewrite the script.          |
| **Take**                  | `versions.ts`                       | One result with the inputs it came from. An element's history lists its takes and restores any of them.                                                            |
| **Pinned**                | `pinned` on a snapshot              | A result the user supplied, such as an upload. It never regenerates.                                                                                               |

## Project

| Term                | Where                  | Means                                                                                                                                                                         |
| ------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Project store**   | `lib/project/store.ts` | A Zustand store for what is not on the canvas: title, settings, pinned models, media. It owns saving and version history.                                                     |
| **Script settings** | `ScriptSettings`       | Language, length and format, read by the script writer.                                                                                                                       |
| **Format**          | `video-format.ts`      | Who speaks: cinematic (characters on screen), faceless (a narrator and voices over pictures) or explainer (a voice, nobody on screen).                                        |
| **Video settings**  | `VideoSettings`        | Aspect ratio, captions, caption style, transition. Layout only.                                                                                                               |
| **Template**        | `lib/templates/`       | A starting brief with its characters, art style, references and length. Applied before a project has a script.                                                                |
| **Media**           | `lib/project/media.ts` | The project's own files. Uploads land there through `useMediaUpload`; Media panel takes land via `useAddDraftTakesToMedia`. Removing one never touches the elements using it. |

## Sloppy

| Term       | Where                    | Means                                                                                                                                           |
| ---------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Sloppy** | `app/components/sloppy/` | The agent in the editor's left panel.                                                                                                           |
| **Turn**   | `lib/api/agent-turn.ts`  | One model response. The server streams its text and tool calls; the tools have specs but no executors there.                                    |
| **Tool**   | `lib/agent/tools/`       | A `defineTool` the browser runs against the canvas, queue and stores. Its result goes back as the next request until the model answers in text. |

The harness is client-side, so Sloppy works through the same canvas, queue and stores as the user, sees edits as they happen, and the client stays the one writer of the project. A new skill is a new tool, not a new pipeline.

## Layout and render

| Term            | Where                    | Means                                                                                                                                                                                   |
| --------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Layout**      | `lib/render/`            | Resolves the canvas and snapshots into a timeline: scene lengths from the speech, visuals spanned across them, transitions. The one length model, shared by preview, render and Sloppy. |
| **Captions**    | `lib/captions/`          | Word timings from an STT job per spoken clip, styled by the video settings.                                                                                                             |
| **Composition** | `remotion/`              | One Remotion composition that draws the timeline as React.                                                                                                                              |
| **Player**      | `app/components/player/` | Plays the composition in the editor, so the preview is the export.                                                                                                                      |
| **Render**      | `/api/render`            | Remotion Lambdas render the same composition in parallel chunks to an MP4 in S3.                                                                                                        |

## Models and keys

| Term             | Where                  | Means                                                                                                                                                              |
| ---------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Model**        | `MODELS`, `models.ts`  | A `{ provider, model }` pair. Each element stores its own; defaults resolve element, then project, then account.                                                   |
| **Provider**     | `lib/providers/`       | A server-side vendor adapter (Anthropic, Runware, ElevenLabs, Cartesia), shared by both route families.                                                            |
| **Hosted**       | `/api/v1`              | Models OpenSlop serves on its own keys.                                                                                                                            |
| **BYOK**         | `/api/third-party`     | Models a user serves on their own key.                                                                                                                             |
| **Gateway**      | `lib/gateway/`         | The HTTP client from a connector to a route family.                                                                                                                |
| **Job**          | `jobs`                 | An asset route records a row and hands it to a Vercel Queue worker, which calls the provider and uploads the result to Blob. The client polls it until it settles. |
| **Provider key** | `provider_keys`, Vault | A user's key for a vendor. Read by the service role only for the request that uses it, never sent to a client.                                                     |

`proxy.ts` refreshes the Supabase session; `withSession` and `withApiAccess` guard the routes.

## Data

Supabase Postgres with row-level security. Generated files live in Vercel Blob.

| Table                          | Holds                                              |
| ------------------------------ | -------------------------------------------------- |
| `projects`                     | The canvas (as OSML), project store and snapshots  |
| `canvas_versions`              | Autosaved history of those columns                 |
| `jobs`                         | Generation jobs, their status and what they cost   |
| `provider_keys`                | One row per user and provider: vault id, last four |
| `conversations` and `messages` | One Sloppy conversation per project, and its turns |

## Adding things

- **Hosted model:** a row in its type's `openslop/models.ts` and in `lib/api/providers/openslop.ts`.
- **BYOK provider:** a provider catalog entry, a models map under `lib/connectors/<type>/<provider>/`, and a vendor class per type with `validate()`.
- **Media type:** a connector, a provider, a models map, a row in `lib/api/asset-routes.ts`, and two route files.
- **Per-type generation behaviour:** a plugin in `lib/connectors/registry.ts`.
- **Sloppy tool:** a `defineTool` in `lib/agent/tools/`, added to the registry.
