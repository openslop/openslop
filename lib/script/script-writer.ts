import { Editor, Transforms } from "slate";
import { createCanvasElement } from "@/lib/canvas/create-canvas-element";
import { findElementById, updateElementText } from "@/lib/canvas/editor-ops";
import { isContentType } from "@/lib/canvas/guards";
import {
	OSMLStreamParser,
	type OSMLElement,
} from "@/lib/canvas/osml-stream-parser";
import { isScene, isScriptEmpty } from "@/lib/canvas/scenes";
import type { ContentType } from "@/lib/canvas/types";

const isContent = (element: OSMLElement): element is OSMLElement<ContentType> =>
	isContentType(element.type);

const clearScript = (editor: Editor) =>
	Transforms.removeNodes(editor, { at: [], match: isScene });

/** Clears the canvas's script, then writes OSML onto it as it arrives, each element growing as its text streams in. */
export function createScriptWriter(editor: Editor): (chunk: string) => void {
	clearScript(editor);
	const parser = new OSMLStreamParser();

	const write = ({ id, type, attrs, text }: OSMLElement<ContentType>) => {
		if (!text) return;
		if (findElementById(editor, id)) return updateElementText(editor, id, text);

		// One normalization, so withLayout seeds no narration back over the empty script it replaces.
		Editor.withoutNormalizing(editor, () => {
			if (isScriptEmpty(editor.children)) clearScript(editor);
			Transforms.insertNodes(
				editor,
				createCanvasElement(type, {
					id,
					attrs,
					text,
					defaultModels: editor.defaultModels(),
				}),
				{ at: [editor.children.length] },
			);
		});
	};

	return (chunk) => parser.appendChunk(chunk).filter(isContent).forEach(write);
}
