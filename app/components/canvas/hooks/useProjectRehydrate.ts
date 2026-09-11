import { useEffect, useRef } from "react";
import type { Editor } from "slate";
import { applyScriptToEditor } from "@/lib/project/applyScript";
import { useResolveDefaultModels } from "@/lib/connectors/useDefaultModels";

export function useProjectRehydrate(editor: Editor, script: string): void {
	const defaultModels = useResolveDefaultModels();
	const ranRef = useRef(false);

	useEffect(() => {
		if (ranRef.current || script.length === 0) return;
		ranRef.current = true;

		applyScriptToEditor(editor, script, defaultModels());
	}, [editor, script, defaultModels]);
}
