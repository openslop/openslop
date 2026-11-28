import { useCallback } from "react";
import {
	useGenerationQueue,
	useQueueSelector,
} from "@/lib/generation/generation-queue-provider";
import { hasPrompt } from "@/lib/generation/graph";
import { staleReason } from "@/lib/generation/stale-reason";
import { buildNode } from "@/lib/generation/generation-graph";
import { useBuildContext } from "@/lib/generation/use-build-context";
import { useLiveNode } from "@/lib/generation/use-live-nodes";
import type { GeneratedElement } from "@/lib/canvas/types";
import { useGenerationStatus } from "./use-generation-status";

export function useGenerate(element: GeneratedElement) {
	const queue = useGenerationQueue();
	const buildContext = useBuildContext();
	const node = useLiveNode(element);
	const { result, error } = useQueueSelector((q) =>
		q.getElementSnapshot(node.id),
	);
	const generation = useGenerationStatus(node.id);
	const reason = useQueueSelector((q) => staleReason(node, q));

	// Built again at the click: a live node's job may lag, see useLiveNode.
	const generate = useCallback(() => {
		const current = buildNode(element, buildContext());
		if (!hasPrompt(current)) {
			queue.setError(current.id, "Enter a prompt first");
			return;
		}
		queue.enqueueGraph([current]);
	}, [queue, element, buildContext]);

	const discard = useCallback(() => {
		queue.discard(node.id);
	}, [queue, node.id]);

	return {
		node,
		...generation,
		result,
		error,
		staleReason: reason,
		hasPrompt: hasPrompt(node),
		hasResult: Boolean(result),
		generate,
		discard,
	};
}
