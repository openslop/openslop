import { useCallback } from "react";
import { Editor } from "slate";
import { useConfig } from "@/lib/config/ConfigProvider";
import { getContentElements } from "@/lib/canvas/scenes";
import { getGenerationInputs } from "@/lib/generation/getGenerationInputs";
import { isStaleResult } from "@/lib/generation/queue";
import { useGenerationQueue } from "@/lib/generation/GenerationQueueProvider";
import { scheduleGeneration } from "@/lib/generation/scheduleGeneration";
import { getProjectStore } from "@/lib/project/store";
import { buildGenerationJob } from "@/lib/generation/buildGenerationJob";

export function useGenerateAll(editor: Editor) {
	const { projectId, connectorConfig } = useConfig();
	const queue = useGenerationQueue();

	const generateAll = useCallback(() => {
		const { metadata } = getProjectStore(projectId).getState();
		const jobs = getContentElements(editor.children)
			.filter((el) => {
				const inputs = getGenerationInputs(el, metadata);
				const snap = queue.getElementSnapshot(el.id);
				const shouldGenerate =
					inputs.prompt && (!snap.result || isStaleResult(snap, inputs));
				return shouldGenerate;
			})
			.map((el) => buildGenerationJob(el, connectorConfig, projectId));
		scheduleGeneration(queue, jobs, { projectId, registry: connectorConfig });
	}, [queue, editor, connectorConfig, projectId]);

	return { generateAll };
}
