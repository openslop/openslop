import { useCallback, useMemo } from "react";
import {
	useGenerationQueue,
	useQueueSelector,
} from "@/lib/generation/GenerationQueueProvider";
import { forElement, needsGeneration } from "@/lib/generation/graph";
import { isGenerationActive } from "@/lib/generation/snapshots";
import { useNodeBuilder } from "@/lib/generation/useNodeBuilder";
import type { CanvasContentElement } from "@/lib/canvas/types";

export type GenerateScope = {
	/** Nothing in scope carries a prompt, so there is nothing to generate. */
	empty: boolean;
	/** Something in scope is queued or running.  */
	active: boolean;
	/** Elements with no result, or whose result no longer matches its inputs. */
	pending: number;
	total: number;
	/** Queues only what is pending, so nothing current is ever paid for twice. */
	generate: () => void;
	/** Queues the whole scope, current results included. */
	regenerate: () => void;
};

/**
 * The generate control for a slice of the document: the whole project, one
 * scene, or any other set of elements. Whether a scoped click may redo current
 * results is the caller's policy; this only reports the scope and runs it.
 */
export function useGenerateScope(
	elements: CanvasContentElement[],
): GenerateScope {
	const queue = useGenerationQueue();
	const buildNode = useNodeBuilder();

	const nodes = useMemo(
		() =>
			elements
				.map((element) => buildNode(forElement(element)))
				.filter((node) => node.inputs.prompt),
		[elements, buildNode],
	);

	const active = useQueueSelector((q) =>
		nodes.some((node) =>
			isGenerationActive(q.getElementSnapshot(node.id).status),
		),
	);
	const pending = useQueueSelector(
		(q) => nodes.filter((node) => needsGeneration(node, q)).length,
	);

	const generate = useCallback(() => {
		queue.enqueueGraph(nodes.filter((node) => needsGeneration(node, queue)));
	}, [queue, nodes]);

	const regenerate = useCallback(() => {
		queue.enqueueGraph(nodes);
	}, [queue, nodes]);

	return {
		empty: nodes.length === 0,
		active,
		pending,
		total: nodes.length,
		generate,
		regenerate,
	};
}
