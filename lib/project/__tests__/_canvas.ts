import type { AssetResult } from "@/lib/connectors/types";
import { inputsFor } from "@/lib/generation/__tests__/_graph";
import { GenerationQueue } from "@/lib/generation/queue";

export function resultQueue(
	results: Record<string, Partial<AssetResult> & { pinned?: boolean }>,
): GenerationQueue {
	const queue = new GenerationQueue();
	for (const [elementId, { pinned = false, ...result }] of Object.entries(
		results,
	))
		queue.restoreResult({
			elementId,
			inputs: inputsFor(""),
			result: { durationSec: 0, ...result },
			connectorType: "image",
			pinned,
		});
	return queue;
}
