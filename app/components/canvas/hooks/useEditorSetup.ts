import { useState } from "react";
import { createEditor } from "slate";
import { withReact } from "slate-react";
import { withHistory } from "slate-history";
import flow from "lodash/flow";
import type { CanvasEditor } from "@/lib/canvas/types";
import { useProjectStoreHandle } from "@/lib/project/ProjectStoreProvider";
import { withNodeId } from "../plugins/withNodeId";
import { withLayout } from "../plugins/withLayout";
import { withScenes } from "../plugins/withScenes";
import { withFlatPaste } from "../plugins/withFlatPaste";
import { withOSMLClipboard } from "../plugins/withOSMLClipboard";

export function useEditorSetup(): CanvasEditor {
	const store = useProjectStoreHandle();

	const [editor] = useState(() => {
		const projectModels = () => store.getState().metadata.connectorModels;
		return flow(
			withHistory,
			withReact,
			withLayout(projectModels),
			withScenes,
			withFlatPaste,
			withNodeId,
			withOSMLClipboard(projectModels),
		)(createEditor());
	});

	return editor;
}
