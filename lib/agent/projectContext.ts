"use client";

import { useCallback } from "react";
import type { Editor } from "slate";
import { getContentElements } from "@/lib/canvas/scenes";
import { useGenerationQueue } from "@/lib/generation/GenerationQueueProvider";
import type { NodeResults } from "@/lib/generation/graph";
import { characterAvatarUrl } from "@/lib/project/characterAvatar";
import { useProjectStoreHandle } from "@/lib/project/ProjectStoreProvider";
import type { ProjectData } from "@/lib/project/store";
import { getTemplateById } from "@/lib/templates/templates";
import type { AgentContext } from "./context";

function toAgentContext(
	state: ProjectData,
	results: NodeResults,
	scriptIsEmpty: boolean,
): AgentContext {
	const { metadata } = state;

	return {
		title: metadata.title,
		style: metadata.style,
		language: metadata.language,
		length: metadata.videoSettings.length,
		aspectRatio: metadata.videoSettings.aspectRatio,
		templateName: metadata.templateId
			? getTemplateById(metadata.templateId)?.name
			: undefined,
		narration: metadata.narration,
		characters: Object.entries(metadata.characters).map(
			([name, character]) => ({
				name,
				hasAppearance: character.appearance.trim().length > 0,
				hasAvatar: Boolean(characterAvatarUrl(results, name)),
			}),
		),
		referenceImageCount: state.referenceImages.length,
		scriptIsEmpty,
	};
}

/** Read fresh per request, so a turn's later steps see what its earlier ones changed. */
export function useAgentContext(editor: Editor): () => AgentContext {
	const store = useProjectStoreHandle();
	const queue = useGenerationQueue();

	return useCallback(
		() =>
			toAgentContext(
				store.getState(),
				queue,
				getContentElements(editor.children).length === 0,
			),
		[store, queue, editor],
	);
}
