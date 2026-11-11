import { ensureAsset } from "@/lib/canvas/asset-ops";
import { findAsset } from "@/lib/canvas/assets";
import { MEDIA_DRAFT_TYPES, type CanvasEditor } from "@/lib/canvas/types";

/** The Media panel always has a draft of each type to write to. */
export const withMediaDrafts = (editor: CanvasEditor): CanvasEditor => {
	const { normalizeNode } = editor;

	editor.normalizeNode = (entry, options) => {
		const [, path] = entry;
		const missing =
			path.length === 0 &&
			MEDIA_DRAFT_TYPES.find((type) => !findAsset(editor.children, type));
		if (missing) return ensureAsset(editor, missing);
		normalizeNode(entry, options);
	};

	return editor;
};
