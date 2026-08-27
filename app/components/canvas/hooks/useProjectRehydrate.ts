import { useEffect, useRef } from "react";
import type { Editor } from "slate";
import { useConfig } from "@/lib/config/ConfigProvider";
import { applyScriptToEditor } from "@/lib/project/applyScript";

export function useProjectRehydrate(editor: Editor, script: string): void {
	const { connectorConfig } = useConfig();
	const ranRef = useRef(false);

	useEffect(() => {
		if (ranRef.current || script.length === 0) return;
		ranRef.current = true;

		applyScriptToEditor(editor, script, connectorConfig);
	}, [editor, script, connectorConfig]);
}
