import { Editor, Transforms } from "slate";
import { HistoryEditor } from "slate-history";
import type { ConnectorModels } from "@/lib/connectors/models";
import { deserializeWithScenes } from "./serialize";

/**
 * Replaces the document outside undo history and clears the stack, whose
 * entries point at paths this swap removes.
 */
export function applyScriptToEditor(
	editor: Editor,
	script: string,
	projectModels?: ConnectorModels,
): void {
	const scenes = deserializeWithScenes(script, projectModels);

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
		editor.history = { undos: [], redos: [] };
		return;
	}

	replaceChildren();
}
