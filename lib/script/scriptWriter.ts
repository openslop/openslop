import { Editor, Transforms } from "slate";
import {
	clearEditor,
	findNodeById,
	updateNodeText,
} from "@/lib/canvas/editorOps";
import { isParsedContentElement } from "@/lib/canvas/guards";
import { getElementBodyText } from "@/lib/canvas/osmlSerializer";
import { OSMLStreamParser } from "@/lib/canvas/osmlStreamParser";
import type { CanvasContentElement } from "@/lib/canvas/types";

function appendElement(editor: Editor, node: CanvasContentElement): void {
	// The parser keeps appending to its own node, so the document takes a copy.
	Transforms.insertNodes(editor, structuredClone(node), {
		at: [editor.children.length],
	});
}

function replaceScript(editor: Editor, node: CanvasContentElement): void {
	// One normalization, so withLayout seeds nothing into the cleared script.
	Editor.withoutNormalizing(editor, () => {
		clearEditor(editor);
		appendElement(editor, node);
	});
}

/** Replaces the canvas's script with OSML as it arrives: the first element clears the old script, the rest append, each growing as its text streams in. */
export function createScriptWriter(editor: Editor): (chunk: string) => void {
	const parser = new OSMLStreamParser();
	let seen = 0;
	let replaced = false;

	const write = (node: CanvasContentElement) => {
		const text = getElementBodyText(node);
		if (!text) return;

		if (findNodeById(editor, node.id)) {
			updateNodeText(editor, node.id, text);
		} else if (replaced) {
			appendElement(editor, node);
		} else {
			replaceScript(editor, node);
			replaced = true;
		}
	};

	return (chunk) => {
		if (!parser.appendChunk(chunk, editor.defaultModels())) return;
		const nodes = parser.getNodes();
		// Text only ever reaches the last node, so all but the last one seen are final.
		const changed = nodes.slice(Math.max(0, seen - 1));
		seen = nodes.length;

		changed.filter(isParsedContentElement).forEach(write);
	};
}
