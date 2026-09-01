import type { CanvasEditor } from "@/lib/canvas/types";
import { insertElement } from "@/lib/canvas/insertElement";
import type { ConnectorModels } from "@/lib/connectors/models";

/** Read per insert, not per editor: the project's models outlive no session. */
export const withLayout =
	(defaultModels: () => ConnectorModels) =>
	(editor: CanvasEditor): CanvasEditor => {
		const { normalizeNode } = editor;

		editor.normalizeNode = ([node, path]) => {
			if (path.length === 0 && editor.children.length < 1) {
				insertElement(editor, "narration", [0], {
					defaultModels: defaultModels(),
				});
			}
			return normalizeNode([node, path]);
		};

		return editor;
	};
