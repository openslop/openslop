import { useCallback, useEffect, useMemo } from "react";
import { useConfig } from "@/lib/config/ConfigProvider";
import { isStaleResult } from "@/lib/generation/queue";
import {
	useGenerationQueue,
	useQueueSelector,
} from "@/lib/generation/GenerationQueueProvider";
import { getGenerationInputs } from "@/lib/generation/getGenerationInputs";
import { scheduleGeneration } from "@/lib/generation/scheduleGeneration";
import { useProjectStore } from "@/lib/project/store";
import type { CanvasContentElement } from "@/lib/canvas/types";
import { buildGenerationJob } from "../utils/buildGenerationJob";

export function useGenerate(element: CanvasContentElement) {
	const { projectId, connectorConfig } = useConfig();
	const queue = useGenerationQueue();
	const snapshot = useQueueSelector((q) => q.getElementSnapshot(element.id));
	const metadata = useProjectStore(projectId, (s) => s.metadata);
	const currentInputs = useMemo(
		() => getGenerationInputs(element, metadata),
		[element, metadata],
	);
	const stale = isStaleResult(snapshot, currentInputs);

	useEffect(() => {
		if (!stale) return;
		queue.restoreResult(element.id, currentInputs);
	}, [queue, element.id, currentInputs, stale]);

	const generate = useCallback(() => {
		if (!currentInputs.prompt) {
			queue.setError(element.id, "Enter a prompt first");
			return;
		}
		const job = buildGenerationJob(element, connectorConfig, projectId);
		scheduleGeneration(queue, [job], { projectId, registry: connectorConfig });
	}, [queue, element, currentInputs.prompt, connectorConfig, projectId]);

	const discard = useCallback(() => {
		queue.discard(element.id);
	}, [queue, element.id]);

	return {
		status: snapshot.status,
		seconds: snapshot.seconds,
		result: snapshot.result,
		error: snapshot.error,
		stale,
		hasPrompt: Boolean(currentInputs.prompt),
		hasResult: Boolean(snapshot.result),
		generate,
		discard,
	};
}
