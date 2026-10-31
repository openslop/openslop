import { useId, useState } from "react";
import { createEditor } from "slate";
import { withHistory } from "slate-history";
import type { CanvasEditor } from "@/lib/canvas/types";
import { resolveDefaultModels } from "@/lib/connectors/models";
import { applyScriptToEditor } from "@/lib/project/apply-script";
import { declaredLanguage } from "@/lib/project/language";
import { useProjectStoreHandle } from "@/lib/project/project-store-provider";
import type { ProjectStore } from "@/lib/project/store";
import { useAccountStoreHandle } from "@/lib/user/account-store-provider";
import type { AccountStore } from "@/lib/user/account-store";
import { withCanvas } from "../plugins/with-canvas";

function createCanvasEditor(
	script: string,
	{ project, account }: { project: ProjectStore; account: AccountStore },
	sceneId: (index: number) => string,
): CanvasEditor {
	const editor = withCanvas(withHistory(createEditor()));
	editor.defaultModels = () =>
		resolveDefaultModels({
			project: project.getState().models,
			account: account.getState().models,
		});
	editor.defaultLanguage = () =>
		declaredLanguage(project.getState().scriptSettings.language);
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
