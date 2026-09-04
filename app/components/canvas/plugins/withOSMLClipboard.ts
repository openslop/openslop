import { Editor, Range, Transforms } from "slate";
import type { CanvasEditor } from "@/lib/canvas/types";
import type { ConnectorModels } from "@/lib/connectors/models";
import { serializeOSMLWithScenes } from "@/lib/canvas/osmlSerializer";
import { parseOSML } from "@/lib/canvas/osmlStreamParser";
import { splitScenes } from "@/lib/project/serialize";
import { isContentElement, isParsedContentElement } from "@/lib/canvas/guards";
import { stripIds } from "@/lib/canvas/nodeUtils";

/** A fragment keeps the ancestor chain, so a few words would still carry their tags. */
const coversWholeElement = (editor: CanvasEditor, at: Range) =>
	Array.from(Editor.nodes(editor, { at, match: isContentElement })).some(
		([, path]) => Range.surrounds(at, Editor.range(editor, path)),
	);

/**
 * Puts OSML on `text/plain`. The Slate fragment is left untouched, so in-app
 * copy/paste stays lossless and keeps flowing through `withFlatPaste` and
 * `withNodeId`.
 */
export const withOSMLClipboard =
	(defaultModels: () => ConnectorModels) =>
	(editor: CanvasEditor): CanvasEditor => {
		const { setFragmentData, insertTextData } = editor;

		editor.setFragmentData = (data, originEvent) => {
			setFragmentData(data, originEvent);
			const { selection } = editor;
			if (!selection || Range.isCollapsed(selection)) return;
			if (!coversWholeElement(editor, selection)) return;
			data.setData("text/plain", serializeOSMLWithScenes(editor.getFragment()));
		};

		editor.insertTextData = (data) => {
			const elements = splitScenes(data.getData("text/plain"))
				.flatMap((sceneOsml) => parseOSML(sceneOsml, defaultModels()))
				.filter(isParsedContentElement)
				.map(stripIds);
			if (elements.length === 0) return insertTextData(data);
			Transforms.insertNodes(editor, elements);
			return true;
		};

		return editor;
	};
