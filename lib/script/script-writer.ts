import { Editor, Transforms } from "slate";
import { findElementById, updateElementText } from "@/lib/canvas/editor-ops";
import { isContentElement } from "@/lib/canvas/guards";
import { getElementBodyText } from "@/lib/canvas/osml-serializer";
import { OSMLStreamParser } from "@/lib/canvas/osml-stream-parser";
import { isScene, isScriptEmpty } from "@/lib/canvas/scenes";
import type { ContentElement } from "@/lib/canvas/types";

const clearScript = (editor: Editor) =>
	Transforms.removeNodes(editor, { at: [], match: isScene });

/** Clears the canvas's script, then writes OSML onto it as it arrives, each element growing as its text streams in. */
export function createScriptWriter(editor: Editor): (chunk: string) => void {
	clearScript(editor);
	const parser = new OSMLStreamParser();
	let seen = 0;

	const write = (node: ContentElement) => {
		const text = getElementBodyText(node);
		if (!text) return;
		if (findElementById(editor, node.id))
			return updateElementText(editor, node.id, text);

		// One normalization, so withLayout seeds no narration back over the empty script it replaces.
		Editor.withoutNormalizing(editor, () => {
			if (isScriptEmpty(editor.children)) clearScript(editor);
			// The parser keeps appending to its own node, so the document takes a copy.
			Transforms.insertNodes(editor, structuredClone(node), {
				at: [editor.children.length],
			});
		});
	};

	return (chunk) => {
		if (!parser.appendChunk(chunk, editor.defaultModels())) return;
		const nodes = parser.getNodes();
		// Text only ever reaches the last node, so all but the last one seen are final.
		const changed = nodes.slice(Math.max(0, seen - 1));
		seen = nodes.length;

		changed.filter(isContentElement).forEach(write);
	};
}
