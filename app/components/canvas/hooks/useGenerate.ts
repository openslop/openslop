import { useCallback, useEffect, useMemo } from "react";
import { useConfig } from "@/lib/config/ConfigProvider";
import { isStaleResult } from "@/lib/generation/queue";
import {
	useGenerationQueue,
	useQueueSelector,
} from "@/lib/generation/GenerationQueueProvider";
import { scheduleGeneration } from "@/lib/generation/scheduleGeneration";
import type { CanvasContentElement } from "../types";
import { buildGenerationJob } from "../utils/buildGenerationJob";
import { getGenerationInputs } from "../utils/getGenerationInputs";

export function useGenerate(element: CanvasContentElement) {
	const { projectId, connectorConfig } = useConfig();
	const queue = useGenerationQueue();
	const snapshot = useQueueSelector((q) => q.getElementSnapshot(element.id));
	const currentInputs = useMemo(() => getGenerationInputs(element), [element]);
	const stale = isStaleResult(snapshot, currentInputs);

	useEffect(() => {
		if (!stale) return;
		queue.restoreResult(element.id, currentInputs);
	}, [queue, element.id, currentInputs, stale]);

	const generate = useCallback(() => {
		const job = buildGenerationJob(element, connectorConfig);
		if (!job) {
			queue.setError(element.id, "Enter a prompt first");
			return;
		}
		scheduleGeneration(queue, job, { projectId, registry: connectorConfig });
	}, [queue, element, connectorConfig, projectId]);

	const discard = useCallback(() => {
		queue.discard(element.id);
	}, [queue, element.id]);

	return {
		generating: snapshot.status === "generating",
		queued: snapshot.status === "queued",
		seconds: snapshot.seconds,
		result: snapshot.result,
		error: snapshot.error,
		stale,
		generate,
		discard,
	};
}
