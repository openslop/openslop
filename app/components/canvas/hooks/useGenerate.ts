import { useCallback, useEffect, useSyncExternalStore } from "react";
import { useConfig } from "@/lib/config/ConfigProvider";
import { generationQueue, isStaleResult } from "@/lib/generation/queue";
import type { CanvasContentElement } from "../types";
import { buildGenerationJob } from "../utils/buildGenerationJob";
import { getGenerationInputs } from "../utils/getGenerationInputs";

export function useGenerate(element: CanvasContentElement) {
	const { connectorConfig } = useConfig();

	const snapshot = useSyncExternalStore(generationQueue.subscribe, () =>
		generationQueue.getElementSnapshot(element.id),
	);

	const currentInputs = getGenerationInputs(element);
	const stale = isStaleResult(snapshot, currentInputs);

	useEffect(() => {
		if (!stale) return;
		generationQueue.restoreResult(element.id, currentInputs);
	}, [element.id, currentInputs, stale]);

	const generate = useCallback(() => {
		const job = buildGenerationJob(element, connectorConfig);
		if (!job) {
			generationQueue.setError(element.id, "Enter a prompt first");
			return;
		}
		generationQueue.enqueue(job);
	}, [element, connectorConfig]);

	const discard = useCallback(() => {
		generationQueue.discard(element.id);
	}, [element.id]);

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
