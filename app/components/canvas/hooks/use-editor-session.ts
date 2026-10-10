import { useConfig } from "@/lib/config/config-provider";
import type { CanvasEditor } from "@/lib/canvas/types";
import type { CanvasHistory } from "@/lib/project/canvas-history";
import { useScriptInitial } from "@/lib/script/script-provider";
import { useCanvasVersions } from "./use-canvas-versions";
import { useEditorSetup } from "./use-editor-setup";

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
