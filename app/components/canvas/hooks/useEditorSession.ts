import { useScriptInitial } from "@/lib/script/ScriptProvider";
import type { SignallingEditor } from "../plugins/withDocumentSignal";
import { useEditorSetup } from "./useEditorSetup";
import { useLayoutKey } from "./useLayoutKey";
import { useMetadataSync } from "./useMetadataSync";
import { useProjectRehydrate } from "./useProjectRehydrate";
import { useScriptSync } from "./useScriptSync";

interface EditorSession {
	editor: SignallingEditor;
	layoutKey: string;
}

/**
 * Owns every wire between the Slate editor and the project: initial hydration,
 * streaming script sync, and metadata sync. Views render the editor; they don't
 * assemble it. The document stays in the editor, so the only thing derived from
 * it that crosses back into the view is the layout key.
 */
export function useEditorSession(): EditorSession {
	const editor = useEditorSetup();

	useProjectRehydrate(editor, useScriptInitial());
	useScriptSync(editor);
	useMetadataSync();

	return { editor, layoutKey: useLayoutKey(editor) };
}
