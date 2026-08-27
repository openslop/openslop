import { useState } from "react";
import { createEditor } from "slate";
import { withReact } from "slate-react";
import { withHistory } from "slate-history";
import flow from "lodash/flow";
import { useConfig } from "@/lib/config/ConfigProvider";
import type { CanvasEditor } from "@/lib/canvas/types";
import { withNodeId } from "../plugins/withNodeId";
import { withLayout } from "../plugins/withLayout";
import { withScenes } from "../plugins/withScenes";
import { withFlatPaste } from "../plugins/withFlatPaste";
import { withOSMLClipboard } from "../plugins/withOSMLClipboard";

export function useEditorSetup(): CanvasEditor {
	const { connectorConfig } = useConfig();

	const [editor] = useState(() =>
		flow(
			withHistory,
			withReact,
			withLayout(connectorConfig),
			withScenes,
			withFlatPaste,
			withNodeId,
			withOSMLClipboard(connectorConfig),
		)(createEditor()),
	);

	return editor;
}
