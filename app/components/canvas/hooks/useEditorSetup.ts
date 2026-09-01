import { useState } from "react";
import { createEditor } from "slate";
import { withReact } from "slate-react";
import { withHistory } from "slate-history";
import flow from "lodash/flow";
import type { CanvasEditor } from "@/lib/canvas/types";
import { resolveDefaultModels } from "@/lib/connectors/models";
import { useProjectStoreHandle } from "@/lib/project/ProjectStoreProvider";
import { useAccountStoreHandle } from "@/lib/user/AccountStoreProvider";
import { withNodeId } from "../plugins/withNodeId";
import { withLayout } from "../plugins/withLayout";
import { withScenes } from "../plugins/withScenes";
import { withFlatPaste } from "../plugins/withFlatPaste";
import { withOSMLClipboard } from "../plugins/withOSMLClipboard";

export function useEditorSetup(): CanvasEditor {
	const store = useProjectStoreHandle();
	const account = useAccountStoreHandle();

	const [editor] = useState(() => {
		const defaultModels = () =>
			resolveDefaultModels({
				project: store.getState().metadata.connectorModels,
				account: account.getState().models,
			});
		return flow(
			withHistory,
			withReact,
			withLayout(defaultModels),
			withScenes,
			withFlatPaste,
			withNodeId,
			withOSMLClipboard(defaultModels),
		)(createEditor());
	});

	return editor;
}
