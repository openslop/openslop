import { useCallback } from "react";
import { Editor } from "slate";
import { useConfig } from "@/lib/config/ConfigProvider";
import { getContentElements } from "@/lib/canvas/scenes";
import { useGenerationQueue } from "@/lib/generation/GenerationQueueProvider";
import { needsGeneration } from "@/lib/generation/graph";
import { resolveGraph } from "@/lib/generation/resolveGraph";
import { projectState } from "@/lib/generation/sourceNodes";

export function useGenerateAll(editor: Editor) {
	const { projectId, connectorConfig } = useConfig();
	const queue = useGenerationQueue();

	const generateAll = useCallback(() => {
		const ctx = {
			projectId,
			registry: connectorConfig,
			state: projectState(projectId),
		};
		const roots = getContentElements(editor.children)
			.map((el) => resolveGraph(el, ctx))
			.filter((node) => node.inputs.prompt && needsGeneration(node, queue));
		queue.enqueueGraph(roots);
	}, [queue, editor, connectorConfig, projectId]);

	return { generateAll };
}
