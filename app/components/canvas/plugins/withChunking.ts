import { Editor, type Ancestor } from "slate";
import type { CanvasEditor } from "@/lib/canvas/types";

/**
 * Scenes per chunk. Below this many scenes `slate-react` builds a flat chunk
 * tree and the optimization costs nothing; above it the tree deepens, so a
 * keystroke reconciles `SCENE_CHUNK_SIZE × depth` scenes instead of all of
 * them. Scenes are heavy subtrees, so the size is far below the plain-text
 * default the walkthrough suggests.
 */
const SCENE_CHUNK_SIZE = 8;

/**
 * Chunks the editor's top-level scenes, per the Slate performance walkthrough.
 * Only the chunks containing changed scenes re-render; the rest are memoized,
 * and their index/parent bookkeeping is skipped entirely.
 *
 * Scene children are left unchunked: a scene holds a handful of elements, which
 * is under any useful chunk size.
 */
export const withChunking = (editor: CanvasEditor): CanvasEditor => {
	editor.getChunkSize = (node: Ancestor) =>
		Editor.isEditor(node) ? SCENE_CHUNK_SIZE : null;

	return editor;
};
