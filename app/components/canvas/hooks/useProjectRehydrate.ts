import { useEffect, useRef } from "react";
import type { Editor } from "slate";
import { applyScriptToEditor } from "@/lib/project/applyScript";
import { useProjectStoreHandle } from "@/lib/project/ProjectStoreProvider";

export function useProjectRehydrate(editor: Editor, script: string): void {
	const store = useProjectStoreHandle();
	const ranRef = useRef(false);

	useEffect(() => {
		if (ranRef.current || script.length === 0) return;
		ranRef.current = true;

		applyScriptToEditor(
			editor,
			script,
			store.getState().metadata.connectorModels,
		);
	}, [editor, script, store]);
}
