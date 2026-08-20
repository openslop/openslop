"use client";

import { useCallback } from "react";
import { useConfig } from "@/lib/config/ConfigProvider";
import { useGenerationQueue } from "@/lib/generation/GenerationQueueProvider";
import { useProject } from "@/lib/project/useProject";
import { useProjectStoreHandle } from "@/lib/project/ProjectStoreProvider";
import { applyTemplate } from "./applyTemplate";
import { getTemplateById, type Template } from "./templates";

/** The template the project writes against, and the two ways it changes. */
export function useTemplate(): {
	template: Template | undefined;
	applyTemplate: (templateId: string) => void;
	clearTemplate: () => void;
} {
	const { connectorConfig } = useConfig();
	const store = useProjectStoreHandle();
	const queue = useGenerationQueue();
	const templateId = useProject((s) => s.metadata.templateId);
	const setTemplate = useProject((s) => s.setTemplate);

	return {
		template: templateId ? getTemplateById(templateId) : undefined,
		applyTemplate: useCallback(
			(id: string) => applyTemplate(store, id, queue, connectorConfig),
			[store, queue, connectorConfig],
		),
		clearTemplate: useCallback(() => setTemplate(undefined), [setTemplate]),
	};
}
