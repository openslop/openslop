import { useState } from "react";
import { createEditor } from "slate";
import { withReact } from "slate-react";
import { withHistory } from "slate-history";
import flow from "lodash/flow";
import { useConfig } from "@/lib/config/ConfigProvider";
import { withNodeId } from "../plugins/withNodeId";
import { withLayout } from "../plugins/withLayout";
import { withScenes } from "../plugins/withScenes";
import { withFlatPaste } from "../plugins/withFlatPaste";
import {
	withDocumentSignal,
	type SignallingEditor,
} from "../plugins/withDocumentSignal";

export function useEditorSetup(): SignallingEditor {
	const { connectorConfig } = useConfig();

	const [editor] = useState(() =>
		flow(
			withHistory,
			withReact,
			withLayout(connectorConfig),
			withScenes,
			withFlatPaste,
			withNodeId,
			withDocumentSignal,
		)(createEditor()),
	);

	return editor;
}
