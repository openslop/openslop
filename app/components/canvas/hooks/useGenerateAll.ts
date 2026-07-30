import { useCallback } from "react";
import { Editor } from "slate";
import { getContentElements } from "@/lib/canvas/scenes";
import { useGenerationQueue } from "@/lib/generation/GenerationQueueProvider";
import { forElement, needsGeneration } from "@/lib/generation/graph";
import { useNodeBuilder } from "@/lib/generation/useNodeBuilder";

export function useGenerateAll(editor: Editor) {
	const queue = useGenerationQueue();
	const buildNode = useNodeBuilder();

	const generateAll = useCallback(() => {
		const roots = getContentElements(editor.children)
			.map((el) => buildNode(forElement(el)))
			.filter((node) => node.inputs.prompt && needsGeneration(node, queue));
		queue.enqueueGraph(roots);
	}, [queue, editor, buildNode]);

	return { generateAll };
}
