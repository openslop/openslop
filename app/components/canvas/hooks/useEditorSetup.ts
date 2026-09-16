import { useState } from "react";
import { createEditor } from "slate";
import { withReact } from "slate-react";
import { withHistory } from "slate-history";
import flow from "lodash/flow";
import type { CanvasEditor } from "@/lib/canvas/types";
import type { ConnectorModels } from "@/lib/connectors/models";
import { useResolveDefaultModels } from "@/lib/connectors/useDefaultModels";
import { applyScriptToEditor } from "@/lib/project/applyScript";
import { withNodeId } from "../plugins/withNodeId";
import { withLayout } from "../plugins/withLayout";
import { withScenes } from "../plugins/withScenes";
import { withFlatPaste } from "../plugins/withFlatPaste";
import { withOSMLClipboard } from "../plugins/withOSMLClipboard";

function createCanvasEditor(
	script: string,
	defaultModels: () => ConnectorModels,
): CanvasEditor {
	const editor = flow(
		withHistory,
		withReact,
		withLayout(defaultModels),
		withScenes,
		withFlatPaste,
		withNodeId,
		withOSMLClipboard(defaultModels),
	)(createEditor());
	// Loading an empty script would seed the layout's narration ahead of the first one streamed in.
	if (script) applyScriptToEditor(editor, script, defaultModels());
	return editor;
}

export function useEditorSetup(script: string): CanvasEditor {
	const defaultModels = useResolveDefaultModels();
	const [editor] = useState(() => createCanvasEditor(script, defaultModels));
	return editor;
}
