import { useState } from "react";
import { createEditor } from "slate";
import { withReact } from "slate-react";
import { withHistory } from "slate-history";
import flow from "lodash/flow";
import type { CanvasEditor } from "@/lib/canvas/types";
import { useResolveDefaultModels } from "@/lib/connectors/useDefaultModels";
import { withNodeId } from "../plugins/withNodeId";
import { withLayout } from "../plugins/withLayout";
import { withScenes } from "../plugins/withScenes";
import { withFlatPaste } from "../plugins/withFlatPaste";
import { withOSMLClipboard } from "../plugins/withOSMLClipboard";

export function useEditorSetup(): CanvasEditor {
	const defaultModels = useResolveDefaultModels();

	const [editor] = useState(() =>
		flow(
			withHistory,
			withReact,
			withLayout(defaultModels),
			withScenes,
			withFlatPaste,
			withNodeId,
			withOSMLClipboard(defaultModels),
		)(createEditor()),
	);

	return editor;
}
