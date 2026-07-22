import type { CanvasEditor } from "@/lib/canvas/types";
import type { ConnectorRegistry } from "@/lib/connectors/registry";
import { insertElement } from "@/lib/canvas/insertElement";

export const withLayout =
	(connectorConfig: ConnectorRegistry) =>
	(editor: CanvasEditor): CanvasEditor => {
		const { normalizeNode } = editor;

		editor.normalizeNode = ([node, path]) => {
			if (path.length === 0 && editor.children.length < 1) {
				insertElement(editor, "narration", [0], connectorConfig);
			}
			return normalizeNode([node, path]);
		};

		return editor;
	};
