import type { AssetResult } from "@/lib/connectors/types";
import { inputsFor } from "@/lib/generation/__tests__/_graph";
import { GenerationQueue } from "@/lib/generation/queue";

export function resultQueue(
	results: Record<string, Partial<AssetResult>>,
): GenerationQueue {
	const queue = new GenerationQueue();
	for (const [elementId, result] of Object.entries(results))
		queue.restoreResult({
			elementId,
			inputs: inputsFor(""),
			result: { durationSec: 0, ...result },
			connectorType: "image",
			elementType: "image",
			pinned: Boolean(result.uploaded),
		});
	return queue;
}
