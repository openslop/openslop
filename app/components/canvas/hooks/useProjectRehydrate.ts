import { useEffect, useRef } from "react";
import { Editor, Transforms } from "slate";
import { HistoryEditor } from "slate-history";
import { useConfig } from "@/lib/config/ConfigProvider";
import type { ConnectorRegistry } from "@/lib/connectors/registry";
import { deserializeWithScenes } from "@/lib/project/serialize";

export function rehydrateProjectEditor(
	editor: Editor,
	script: string,
	connectorConfig: ConnectorRegistry,
): void {
	const scenes = deserializeWithScenes(script, connectorConfig);
	if (scenes.length === 0) return;

	const replaceChildren = () => {
		Editor.withoutNormalizing(editor, () => {
			while (editor.children.length > 0) {
				Transforms.removeNodes(editor, { at: [0] });
			}
			scenes.forEach((scene, i) => {
				Transforms.insertNodes(editor, scene, { at: [i] });
			});
		});
		Editor.normalize(editor, { force: true });
	};

	if (HistoryEditor.isHistoryEditor(editor)) {
		HistoryEditor.withoutSaving(editor, replaceChildren);
		return;
	}

	replaceChildren();
}

export function useProjectRehydrate(editor: Editor, script: string): void {
	const { connectorConfig } = useConfig();
	const ranRef = useRef(false);

	useEffect(() => {
		if (ranRef.current) return;
		ranRef.current = true;

		rehydrateProjectEditor(editor, script, connectorConfig);
	}, [editor, script, connectorConfig]);
}
