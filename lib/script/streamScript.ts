import { Transforms, type Editor } from "slate";
import {
	clearEditor,
	findNodeById,
	updateNodeText,
} from "@/lib/canvas/editorOps";
import { isParsedContentElement } from "@/lib/canvas/guards";
import { collectMetadata } from "@/lib/canvas/osmlMetadata";
import { getElementBodyText } from "@/lib/canvas/osmlSerializer";
import { OSMLStreamParser } from "@/lib/canvas/osmlStreamParser";
import type { CanvasContentElement, ParsedElement } from "@/lib/canvas/types";
import type { ConnectorModels } from "@/lib/connectors/models";
import type { LLMConnector } from "@/lib/connectors/types";
import type { ProjectStore } from "@/lib/project/store";
import { buildScriptPrompt, type ScriptSource } from "./prompt/build";

/** Where a script lands: the document, the project it describes, and the models its elements take. */
export type ScriptCanvas = {
	editor: Editor;
	store: ProjectStore;
	defaultModels: () => ConnectorModels;
};

function writeElement(
	editor: Editor,
	node: ParsedElement & CanvasContentElement,
): void {
	const text = getElementBodyText(node);
	if (!text) return;

	const entry = findNodeById(editor, node.id);
	if (entry) {
		updateNodeText(editor, entry[1], text);
		return;
	}
	// The parser keeps appending to its own node, so the document takes a copy.
	Transforms.insertNodes(editor, structuredClone(node), {
		at: [editor.children.length],
	});
}

/**
 * Writes OSML onto the canvas as it arrives. An element lands at the end of
 * the document once it has text and grows with it; a `metadata_*` tag patches
 * the project instead. Each element is normalized as it lands, so the scenes
 * come out the same however the text was chunked.
 */
export function createScriptWriter({
	editor,
	store,
	defaultModels,
}: ScriptCanvas): (chunk: string) => void {
	const parser = new OSMLStreamParser();
	let seen = 0;

	return (chunk) => {
		if (!parser.appendChunk(chunk, defaultModels())) return;
		const nodes = parser.getNodes();
		// Text only ever reaches the last node, so all but the last one seen are final.
		const changed = nodes.slice(Math.max(0, seen - 1));
		seen = nodes.length;

		store.getState().updateMetadata(collectMetadata(changed));
		for (const node of changed.filter(isParsedContentElement))
			writeElement(editor, node);
	};
}

/** Replaces the canvas with a script the model writes from `source`. */
export async function streamScript(
	canvas: ScriptCanvas,
	llm: LLMConnector,
	source: ScriptSource,
	signal?: AbortSignal,
): Promise<void> {
	clearEditor(canvas.editor);
	const write = createScriptWriter(canvas);
	const { system, prompt } = buildScriptPrompt(
		canvas.store.getState().metadata,
		source,
	);

	// Every change to the document re-runs what subscribes to it, and at one per
	// token a long script falls behind its own stream. A burst of tokens is
	// written in one go instead, which the editor reports as a single change.
	const pending: string[] = [];
	const flush = () => pending.splice(0).forEach(write);
	try {
		for await (const { text } of llm.stream(
			{ prompt, systemPrompt: system },
			signal,
		)) {
			if (!text) continue;
			if (pending.length === 0) setTimeout(flush);
			pending.push(text);
		}
	} finally {
		flush();
	}
}
