"use client";

import { useCallback } from "react";
import { useSlateStatic } from "slate-react";
import { useGenerationQueue } from "@/lib/generation/generation-queue-provider";
import { useBuildContext } from "@/lib/generation/use-build-context";
import { useProjectStoreHandle } from "@/lib/project/project-store-provider";
import { useProject } from "@/lib/project/use-project";
import { applyTemplate } from "./apply-template";
import { getTemplateById, type Template } from "./templates";

/** The template the project writes against, and the two ways it changes. */
export function useTemplate(): {
	template: Template | undefined;
	applyTemplate: (templateId: string) => void;
	clearTemplate: () => void;
} {
	const editor = useSlateStatic();
	const store = useProjectStoreHandle();
	const queue = useGenerationQueue();
	const buildContext = useBuildContext();
	const template = useProject((state) => state.scriptSettings.template);

	return {
		template: getTemplateById(template),
		applyTemplate: useCallback(
			(id: string) => applyTemplate(editor, store, queue, buildContext, id),
			[editor, store, queue, buildContext],
		),
		clearTemplate: useCallback(
			() => store.getState().updateScriptSettings({ template: undefined }),
			[store],
		),
	};
}
