import { useCallback, useEffect, useMemo } from "react";
import { useElementHistoryStore } from "@/lib/generation/ElementHistoryProvider";
import {
	useGenerationQueue,
	useQueueSelector,
} from "@/lib/generation/GenerationQueueProvider";
import { forElement, isNodeStale, nodeInputs } from "@/lib/generation/graph";
import { useNodeBuilder } from "@/lib/generation/useNodeBuilder";
import type { CanvasContentElement } from "@/lib/canvas/types";

export function useGenerate(element: CanvasContentElement) {
	const queue = useGenerationQueue();
	const history = useElementHistoryStore();
	const buildNode = useNodeBuilder();
	const snapshot = useQueueSelector((q) => q.getElementSnapshot(element.id));
	const node = useMemo(
		() => buildNode(forElement(element)),
		[buildNode, element],
	);
	const stale = useQueueSelector((q) => isNodeStale(node, q));

	useEffect(() => {
		if (!stale) return;
		const inputs = nodeInputs(node, queue);
		const take = history.matching(element.id, inputs);
		if (take) queue.restoreResult(element.id, inputs, take.result);
	}, [queue, history, element.id, node, stale]);

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
		status: snapshot.status,
		seconds: snapshot.seconds,
		result: snapshot.result,
		error: snapshot.error,
		pinned: snapshot.pinned,
		stale,
		hasPrompt: Boolean(node.inputs.prompt),
		hasResult: Boolean(snapshot.result),
		generate,
		discard,
	};
}
