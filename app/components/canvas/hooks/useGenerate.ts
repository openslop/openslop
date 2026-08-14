import { useCallback, useEffect } from "react";
import {
	useGenerationQueue,
	useQueueSelector,
} from "@/lib/generation/GenerationQueueProvider";
import { forElement, isNodeStale, nodeInputs } from "@/lib/generation/graph";
import { serializeInputs } from "@/lib/generation/inputs";
import { useGenerationValue } from "@/lib/generation/useGenerationValue";
import { useNodeBuilder } from "@/lib/generation/useNodeBuilder";
import type { CanvasContentElement } from "@/lib/canvas/types";

export function useGenerate(element: CanvasContentElement) {
	const queue = useGenerationQueue();
	const buildNode = useNodeBuilder();
	const snapshot = useQueueSelector((q) => q.getElementSnapshot(element.id));
	const node = buildNode(forElement(element));

	// The inputs this element would regenerate from, or null while its result is
	// current. Watching the inputs rather than the node keeps project edits that
	// nothing here reads off every card's render path.
	const staleInputs = useGenerationValue((q) => {
		const current = buildNode(forElement(element));
		return isNodeStale(current, q)
			? serializeInputs(nodeInputs(current, q))
			: null;
	});

	useEffect(() => {
		if (!staleInputs) return;
		const current = buildNode(forElement(element));
		queue.restoreResult(element.id, nodeInputs(current, queue));
	}, [queue, element, buildNode, staleInputs]);

	const generate = useCallback(() => {
		const current = buildNode(forElement(element));
		if (!current.inputs.prompt) {
			queue.setError(element.id, "Enter a prompt first");
			return;
		}
		queue.enqueueGraph([current]);
	}, [queue, element, buildNode]);

	const discard = useCallback(() => {
		queue.discard(element.id);
	}, [queue, element.id]);

	return {
		node,
		status: snapshot.status,
		seconds: snapshot.seconds,
		result: snapshot.result,
		error: snapshot.error,
		stale: staleInputs !== null,
		hasPrompt: Boolean(node.inputs.prompt),
		hasResult: Boolean(snapshot.result),
		generate,
		discard,
	};
}
