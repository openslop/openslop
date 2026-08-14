import { useMemo } from "react";
import type { Descendant, Editor } from "slate";
import { useConfig } from "@/lib/config/ConfigProvider";
import { useScriptInitial } from "@/lib/script/ScriptProvider";
import { getLayoutKey } from "@/lib/video/layoutKey";
import { useVideoSetting } from "@/lib/video/useVideoSetting";
import { useAutosave } from "./useAutosave";
import { useEditorSetup } from "./useEditorSetup";
import { useMetadataSync } from "./useMetadataSync";
import { useProjectRehydrate } from "./useProjectRehydrate";
import { useScriptSync } from "./useScriptSync";

interface EditorSession {
	editor: Editor;
	value: Descendant[];
	setValue: (value: Descendant[]) => void;
	layoutKey: string;
}

/**
 * Owns every wire between the Slate editor and the project: initial hydration,
 * streaming script sync, metadata sync, and autosave. Views render the editor;
 * they don't assemble it.
 */
export function useEditorSession(): EditorSession {
	const { editor, value, setValue } = useEditorSetup();
	const { projectId } = useConfig();

	useProjectRehydrate(editor, useScriptInitial());
	useAutosave(projectId, value);
	useScriptSync(editor);
	useMetadataSync();

	const transitionType = useVideoSetting("transitionType");
	const layoutKey = useMemo(
		() => getLayoutKey(value, transitionType),
		[value, transitionType],
	);

	return { editor, value, setValue, layoutKey };
}
