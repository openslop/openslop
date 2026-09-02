import { useCallback, useMemo } from "react";
import {
	useGenerationQueue,
	useQueueSelector,
} from "@/lib/generation/GenerationQueueProvider";
import { forElement, type NodeSpec } from "@/lib/generation/graph";
import { staleReason } from "@/lib/generation/staleReason";
import { useNodeBuilder } from "@/lib/generation/useNodeBuilder";
import type { CanvasContentElement } from "@/lib/canvas/types";

/** One generation lifecycle for whatever node `spec` names. Memoize the spec. */
export function useGenerateNode(spec: NodeSpec) {
	const queue = useGenerationQueue();
	const buildNode = useNodeBuilder();
	const node = useMemo(() => buildNode(spec), [buildNode, spec]);
	const snapshot = useQueueSelector((q) => q.getElementSnapshot(node.id));
	const reason = useQueueSelector((q) => staleReason(node, q));

	const generate = useCallback(() => {
		if (!node.inputs.prompt) {
			queue.setError(node.id, "Enter a prompt first");
			return;
		}
		queue.enqueueGraph([node]);
	}, [queue, node]);

	const discard = useCallback(() => {
		queue.discard(node.id);
	}, [queue, node.id]);

	return {
		node,
		status: snapshot.status,
		seconds: snapshot.seconds,
		result: snapshot.result,
		error: snapshot.error,
		pinned: snapshot.pinned,
		staleReason: reason,
		hasPrompt: Boolean(node.inputs.prompt),
		hasResult: Boolean(snapshot.result),
		generate,
		discard,
	};
}

export function useGenerate(element: CanvasContentElement) {
	const spec = useMemo(() => forElement(element), [element]);
	return useGenerateNode(spec);
}
