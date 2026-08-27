import { Editor, Transforms } from "slate";
import { HistoryEditor } from "slate-history";
import type { ConnectorRegistry } from "@/lib/connectors/registry";
import { deserializeWithScenes } from "./serialize";

/** Outside undo history: loading or restoring is not something to undo into. */
export function applyScriptToEditor(
	editor: Editor,
	script: string,
	connectors: ConnectorRegistry,
): void {
	const scenes = deserializeWithScenes(script, connectors);

	const replaceChildren = () => {
		Editor.withoutNormalizing(editor, () => {
			Transforms.removeNodes(editor, {
				at: [],
				match: (_node, path) => path.length === 1,
			});
			Transforms.insertNodes(editor, scenes, { at: [0] });
		});
		Editor.normalize(editor, { force: true });
	};

	if (HistoryEditor.isHistoryEditor(editor)) {
		HistoryEditor.withoutSaving(editor, replaceChildren);
		return;
	}

	replaceChildren();
}
