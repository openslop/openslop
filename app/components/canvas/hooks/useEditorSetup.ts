import { useId, useState } from "react";
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
	sceneId: (index: number) => string,
): CanvasEditor {
	const editor = flow(
		withHistory,
		withReact,
		withLayout,
		withScenes,
		withFlatPaste,
		withNodeId,
		withOSMLClipboard,
	)(createEditor());
	editor.defaultModels = defaultModels;
	// Loading an empty script would seed the layout's narration ahead of the first one streamed in.
	if (script) applyScriptToEditor(editor, script, defaultModels(), sceneId);
	return editor;
}

export function useEditorSetup(script: string): CanvasEditor {
	const defaultModels = useResolveDefaultModels();
	// Scene ids render as data-scene-id, so the server render and hydration must mint the same ones.
	const idPrefix = useId();
	const [editor] = useState(() =>
		createCanvasEditor(script, defaultModels, (index) => `${idPrefix}${index}`),
	);
	return editor;
}
