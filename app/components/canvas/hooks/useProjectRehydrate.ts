import { useEffect, useRef } from "react";
import { Editor, Transforms } from "slate";
import { useConfig } from "@/lib/config/ConfigProvider";
import { deserializeWithScenes } from "@/lib/project/serialize";

export function useProjectRehydrate(editor: Editor, script: string): void {
	const { connectorConfig } = useConfig();
	const ranRef = useRef(false);

	useEffect(() => {
		if (ranRef.current) return;
		ranRef.current = true;

		const scenes = deserializeWithScenes(script, connectorConfig);
		if (scenes.length === 0) return;

		Editor.withoutNormalizing(editor, () => {
			while (editor.children.length > 0) {
				Transforms.removeNodes(editor, { at: [0] });
			}
			scenes.forEach((scene, i) => {
				Transforms.insertNodes(editor, scene, { at: [i] });
			});
		});
		Editor.normalize(editor, { force: true });
	}, [editor, script, connectorConfig]);
}
