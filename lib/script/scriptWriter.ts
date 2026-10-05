import { Editor, Transforms } from "slate";
import {
	clearEditor,
	findNodeById,
	updateNodeText,
} from "@/lib/canvas/editorOps";
import { isParsedContentElement } from "@/lib/canvas/guards";
import { getElementBodyText } from "@/lib/canvas/osmlSerializer";
import { OSMLStreamParser } from "@/lib/canvas/osmlStreamParser";
import { isScriptEmpty } from "@/lib/canvas/scenes";
import type { CanvasContentElement, ParsedElement } from "@/lib/canvas/types";

function writeElement(
	editor: Editor,
	node: ParsedElement & CanvasContentElement,
): void {
	const text = getElementBodyText(node);
	if (!text) return;

	if (findNodeById(editor, node.id)) {
		updateNodeText(editor, node.id, text);
		return;
	}
	// Replaces an empty script's placeholder in one normalization, so withLayout seeds none back.
	Editor.withoutNormalizing(editor, () => {
		if (isScriptEmpty(editor.children)) clearEditor(editor);
		// The parser keeps appending to its own node, so the document takes a copy.
		Transforms.insertNodes(editor, structuredClone(node), {
			at: [editor.children.length],
		});
	});
}

/** Writes the script's OSML as it arrives: an element lands at the end once it has text, then grows. */
export function createScriptWriter(editor: Editor): (chunk: string) => void {
	const parser = new OSMLStreamParser();
	let seen = 0;

	return (chunk) => {
		if (!parser.appendChunk(chunk, editor.defaultModels())) return;
		const nodes = parser.getNodes();
		// Text only ever reaches the last node, so all but the last one seen are final.
		const changed = nodes.slice(Math.max(0, seen - 1));
		seen = nodes.length;

		for (const node of changed.filter(isParsedContentElement))
			writeElement(editor, node);
	};
}
