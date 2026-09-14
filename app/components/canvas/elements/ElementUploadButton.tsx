"use client";

import { useGenerationQueue } from "@/lib/generation/GenerationQueueProvider";
import { isGenerationActive } from "@/lib/generation/snapshots";
import { makesPicture } from "@/lib/canvas/types";
import { isSourceNode } from "@/lib/generation/graph";
import { UploadImageButton } from "@/lib/upload/UploadImageButton";
import { useElementGeneration } from "./ElementGenerationContext";

/** Supplies the picture an element would otherwise generate, so only the elements that make one offer it. */
export function ElementUploadButton() {
	const queue = useGenerationQueue();
	const { node, status } = useElementGeneration();
	if (isSourceNode(node) || !makesPicture(node.job.elementType)) return null;

	return (
		<UploadImageButton
			className="shrink-0"
			disabled={isGenerationActive(status)}
			onUpload={(url) =>
				queue.commitResult(
					node,
					{ imageUrl: url, durationSec: 0 },
					{ pinned: true },
				)
			}
		/>
	);
}
