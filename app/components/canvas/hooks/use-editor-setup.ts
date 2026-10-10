import { useId, useState } from "react";
import { createEditor } from "slate";
import { withReact } from "slate-react";
import { withHistory } from "slate-history";
import flow from "lodash/flow";
import type { CanvasEditor } from "@/lib/canvas/types";
import { resolveDefaultModels } from "@/lib/connectors/models";
import { applyScriptToEditor } from "@/lib/project/apply-script";
import { useProjectStoreHandle } from "@/lib/project/project-store-provider";
import type { ProjectStore } from "@/lib/project/store";
import { useAccountStoreHandle } from "@/lib/user/account-store-provider";
import type { AccountStore } from "@/lib/user/account-store";
import { withAssets } from "../plugins/with-assets";
import { withLayout } from "../plugins/with-layout";
import { withNodeId } from "../plugins/with-node-id";
import { withScenes } from "../plugins/with-scenes";
import { withFlatPaste } from "../plugins/with-flat-paste";
import { withOSMLClipboard } from "../plugins/with-osml-clipboard";

function createCanvasEditor(
	script: string,
	{ project, account }: { project: ProjectStore; account: AccountStore },
	sceneId: (index: number) => string,
): CanvasEditor {
	const editor = flow(
		withHistory,
		withReact,
		withLayout,
		withAssets,
		withScenes,
		withFlatPaste,
		withNodeId,
		withOSMLClipboard,
	)(createEditor());
	editor.defaultModels = () =>
		resolveDefaultModels({
			project: project.getState().models,
			account: account.getState().models,
		});
	applyScriptToEditor(editor, script, sceneId);
	return editor;
}

export function useEditorSetup(script: string): CanvasEditor {
	const project = useProjectStoreHandle();
	const account = useAccountStoreHandle();
	// Scene ids render as data-scene-id, so the server render and hydration must mint the same ones.
	const idPrefix = useId();
	const [editor] = useState(() =>
		createCanvasEditor(
			script,
			{ project, account },
			(index) => `${idPrefix}${index}`,
		),
	);
	return editor;
}
