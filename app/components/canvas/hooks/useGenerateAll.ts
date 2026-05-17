import { useCallback } from "react";
import { Editor } from "slate";
import { useConfig } from "@/lib/config/ConfigProvider";
import { isStaleResult } from "@/lib/generation/queue";
import { useGenerationQueue } from "@/lib/generation/GenerationQueueProvider";
import { scheduleGeneration } from "@/lib/generation/scheduleGeneration";
import { buildGenerationJob } from "../utils/buildGenerationJob";
import { getGenerationInputs } from "../utils/getGenerationInputs";
import { getContentElements } from "../utils/nodeUtils";

export function useGenerateAll(editor: Editor) {
	const { projectId, connectorConfig } = useConfig();
	const queue = useGenerationQueue();

	const generateAll = useCallback(() => {
		const jobs = getContentElements(editor.children)
			.filter((el) => {
				const snap = queue.getElementSnapshot(el.id);
				return !snap.result || isStaleResult(snap, getGenerationInputs(el));
			})
			.map((el) => buildGenerationJob(el, connectorConfig, projectId))
			.filter((job): job is NonNullable<typeof job> => job !== null);
		scheduleGeneration(queue, jobs, { projectId, registry: connectorConfig });
	}, [queue, editor, connectorConfig, projectId]);

	return { generateAll };
}
