import { useConfig } from "@/lib/config/ConfigProvider";
import type { CanvasEditor } from "@/lib/canvas/types";
import type { CanvasHistory } from "@/lib/project/canvasHistory";
import { useScriptInitial } from "@/lib/script/ScriptProvider";
import { useCanvasVersions } from "./useCanvasVersions";
import { useEditorSetup } from "./useEditorSetup";
import { useMetadataSync } from "./useMetadataSync";
import { useProjectRehydrate } from "./useProjectRehydrate";
import { useScriptSync } from "./useScriptSync";

interface EditorSession {
	editor: CanvasEditor;
	onDocumentChange: () => void;
	history: CanvasHistory;
}

/**
 * Owns every wire between the Slate editor and the project: initial hydration,
 * streaming script sync, metadata sync, autosave and version history. Views
 * render the editor; they don't assemble it.
 */
export function useEditorSession(): EditorSession {
	const editor = useEditorSetup();
	const { projectId } = useConfig();

	useProjectRehydrate(editor, useScriptInitial());
	useScriptSync(editor);
	useMetadataSync();
	const { history, onDocumentChange } = useCanvasVersions(projectId, editor);

	return { editor, onDocumentChange, history };
}
