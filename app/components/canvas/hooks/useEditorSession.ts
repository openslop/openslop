import { useConfig } from "@/lib/config/ConfigProvider";
import type { CanvasEditor } from "@/lib/canvas/types";
import { useScriptInitial } from "@/lib/script/ScriptProvider";
import { useAutosave } from "./useAutosave";
import { useEditorSetup } from "./useEditorSetup";
import { useMetadataSync } from "./useMetadataSync";
import { useProjectRehydrate } from "./useProjectRehydrate";
import { useScriptSync } from "./useScriptSync";

interface EditorSession {
	editor: CanvasEditor;
	onDocumentChange: () => void;
}

/**
 * Owns every wire between the Slate editor and the project: initial hydration,
 * streaming script sync, metadata sync, and autosave. Views render the editor;
 * they don't assemble it.
 */
export function useEditorSession(): EditorSession {
	const editor = useEditorSetup();
	const { projectId } = useConfig();

	useProjectRehydrate(editor, useScriptInitial());
	useScriptSync(editor);
	useMetadataSync();
	const onDocumentChange = useAutosave(projectId, editor);

	return { editor, onDocumentChange };
}
