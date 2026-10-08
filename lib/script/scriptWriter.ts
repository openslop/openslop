import { Editor, Transforms } from "slate";
import { findElementById, updateElementText } from "@/lib/canvas/editorOps";
import { isContentElement } from "@/lib/canvas/guards";
import { getElementBodyText } from "@/lib/canvas/osmlSerializer";
import { OSMLStreamParser } from "@/lib/canvas/osmlStreamParser";
import { isScene } from "@/lib/canvas/scenes";
import type { ContentElement } from "@/lib/canvas/types";

/** Replaces the canvas's script with OSML as it arrives: the first element clears the old script, the rest append, each growing as its text streams in. */
export function createScriptWriter(editor: Editor): (chunk: string) => void {
	const parser = new OSMLStreamParser();
	let seen = 0;
	let cleared = false;

	const write = (node: ContentElement) => {
		const text = getElementBodyText(node);
		if (!text) return;
		if (findElementById(editor, node.id))
			return updateElementText(editor, node.id, text);

		// One normalization, so withLayout seeds nothing into the cleared script.
		Editor.withoutNormalizing(editor, () => {
			if (!cleared) Transforms.removeNodes(editor, { at: [], match: isScene });
			cleared = true;
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
