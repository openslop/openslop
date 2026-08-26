import { Editor, Point, Range, Transforms } from "slate";
import type { CanvasEditor } from "@/lib/canvas/types";
import type { ConnectorRegistry } from "@/lib/connectors/registry";
import { serializeOSMLWithScenes } from "@/lib/canvas/osmlSerializer";
import { looksLikeOSML, parseOSML } from "@/lib/canvas/osmlStreamParser";
import { isContentElement, isParsedContentElement } from "@/lib/canvas/guards";
import { stripIds } from "@/lib/canvas/nodeUtils";

/**
 * A fragment keeps the ancestor chain from the root, so serializing a few words
 * inside one element would still put its tags on the clipboard. Copying tags is
 * only what the user meant once the selection swallows a whole element.
 */
function coversWholeElement(editor: CanvasEditor, at: Range): boolean {
	const [start, end] = Range.edges(at);
	for (const [, path] of Editor.nodes(editor, {
		at,
		match: isContentElement,
	})) {
		const element = Editor.range(editor, path);
		if (
			Point.compare(start, element.anchor) <= 0 &&
			Point.compare(end, element.focus) >= 0
		)
			return true;
	}
	return false;
}

/**
 * Makes OSML the canvas clipboard format: copy writes it to `text/plain` so a
 * selection survives outside the app, and paste parses it back into elements.
 * The Slate fragment is left untouched, so in-app copy/paste stays lossless and
 * keeps flowing through `withFlatPaste` and `withNodeId`.
 *
 * Scene markers are not reinstated on paste: `withScenes` derives scene
 * boundaries from foreground elements, so inserting the elements alone
 * reproduces the source grouping.
 */
export const withOSMLClipboard =
	(connectors: ConnectorRegistry) =>
	(editor: CanvasEditor): CanvasEditor => {
		const { setFragmentData, insertTextData } = editor;

		editor.setFragmentData = (data, originEvent) => {
			setFragmentData(data, originEvent);
			const { selection } = editor;
			if (!selection || Range.isCollapsed(selection)) return;
			if (!coversWholeElement(editor, selection)) return;
			const osml = serializeOSMLWithScenes(editor.getFragment());
			if (osml) data.setData("text/plain", osml);
		};

		editor.insertTextData = (data) => {
			const text = data.getData("text/plain");
			if (!looksLikeOSML(text)) return insertTextData(data);
			const elements = parseOSML(text, connectors)
				.filter(isParsedContentElement)
				.map(stripIds);
			if (elements.length === 0) return insertTextData(data);
			Transforms.insertNodes(editor, elements);
			return true;
		};

		return editor;
	};
