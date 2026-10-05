import { useId, useState } from "react";
import { createEditor } from "slate";
import { withReact } from "slate-react";
import { withHistory } from "slate-history";
import flow from "lodash/flow";
import type { CanvasEditor } from "@/lib/canvas/types";
import { resolveDefaultModels } from "@/lib/connectors/models";
import { applyScriptToEditor } from "@/lib/project/applyScript";
import { useProjectStoreHandle } from "@/lib/project/ProjectStoreProvider";
import type { ProjectStore } from "@/lib/project/store";
import { useAccountStoreHandle } from "@/lib/user/AccountStoreProvider";
import type { AccountStore } from "@/lib/user/accountStore";
import { withAssets } from "../plugins/withAssets";
import { withLayout } from "../plugins/withLayout";
import { withNodeId } from "../plugins/withNodeId";
import { withScenes } from "../plugins/withScenes";
import { withFlatPaste } from "../plugins/withFlatPaste";
import { withOSMLClipboard } from "../plugins/withOSMLClipboard";

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
	if (script) applyScriptToEditor(editor, script, sceneId);
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
