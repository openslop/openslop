import { useCallback, useEffect, useMemo } from "react";
import {
	useGenerationQueue,
	useQueueSelector,
} from "@/lib/generation/GenerationQueueProvider";
import {
	forElement,
	isNodeStale,
	nodeInputs,
	nodeProgress,
} from "@/lib/generation/graph";
import { useNodeBuilder } from "@/lib/generation/useNodeBuilder";
import type { CanvasContentElement } from "@/lib/canvas/types";

export function useGenerate(element: CanvasContentElement) {
	const queue = useGenerationQueue();
	const buildNode = useNodeBuilder();
	const snapshot = useQueueSelector((q) => q.getElementSnapshot(element.id));
	const node = useMemo(
		() => buildNode(forElement(element)),
		[buildNode, element],
	);
	const stale = useQueueSelector((q) => isNodeStale(node, q));
	const progress = useQueueSelector((q) => nodeProgress(node, q));

	useEffect(() => {
		if (!stale) return;
		queue.restoreResult(element.id, nodeInputs(node, queue));
	}, [queue, element.id, node, stale]);

	const generate = useCallback(() => {
		if (!node.inputs.prompt) {
			queue.setError(element.id, "Enter a prompt first");
			return;
		}
		queue.enqueueGraph([node]);
	}, [queue, element.id, node]);

	const discard = useCallback(() => {
		queue.discard(element.id);
	}, [queue, element.id]);

	return {
		node,
		status: progress.status,
		seconds: progress.seconds,
		result: snapshot.result,
		error: snapshot.error,
		stale,
		hasPrompt: Boolean(node.inputs.prompt),
		hasResult: Boolean(snapshot.result),
		generate,
		discard,
	};
}
