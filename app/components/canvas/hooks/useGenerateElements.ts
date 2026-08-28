import { useCallback } from "react";
import { useGenerationQueue } from "@/lib/generation/GenerationQueueProvider";
import { forElement, needsGeneration } from "@/lib/generation/graph";
import { useNodeBuilder } from "@/lib/generation/useNodeBuilder";
import type { CanvasContentElement } from "@/lib/canvas/types";

/**
 * Queues whichever of `elements` still need generating. The scope arrives at
 * call time so one callback serves the whole project, a single scene, or any
 * other slice, and stays stable across renders.
 */
export function useGenerateElements() {
	const queue = useGenerationQueue();
	const buildNode = useNodeBuilder();

	return useCallback(
		(elements: CanvasContentElement[]) => {
			const roots = elements
				.map((element) => buildNode(forElement(element)))
				.filter((node) => node.inputs.prompt && needsGeneration(node, queue));
			queue.enqueueGraph(roots);
		},
		[queue, buildNode],
	);
}
