import { useConfig } from "@/lib/config/ConfigProvider";
import type { CanvasEditor } from "@/lib/canvas/types";
import type { CanvasHistory } from "@/lib/project/canvasHistory";
import { useScriptInitial } from "@/lib/script/ScriptProvider";
import { useCanvasVersions } from "./useCanvasVersions";
import { useEditorSetup } from "./useEditorSetup";

interface EditorSession {
	editor: CanvasEditor;
	onDocumentChange: () => void;
	history: CanvasHistory;
}

/**
 * Owns every wire between the Slate editor and the project: the saved script
 * it opens on, autosave and version history. Views render the editor; they
 * don't assemble it.
 */
export function useEditorSession(): EditorSession {
	const script = useScriptInitial();
	const editor = useEditorSetup(script);
	const { projectId } = useConfig();
	const { history, onDocumentChange } = useCanvasVersions(projectId, editor);

	return { editor, onDocumentChange, history };
}
