"use client";

import { useCallback } from "react";
import { useSlateStatic } from "slate-react";
import { useGenerationQueue } from "@/lib/generation/GenerationQueueProvider";
import { useBuildContext } from "@/lib/generation/useBuildContext";
import { useProjectStoreHandle } from "@/lib/project/ProjectStoreProvider";
import { useProject } from "@/lib/project/useProject";
import { applyTemplate } from "./applyTemplate";
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
	const template = useProject((state) => state.settings.template);

	return {
		template: getTemplateById(template),
		applyTemplate: useCallback(
			(id: string) => applyTemplate(editor, store, queue, buildContext, id),
			[editor, store, queue, buildContext],
		),
		clearTemplate: useCallback(
			() => store.getState().updateSettings({ template: undefined }),
			[store],
		),
	};
}
