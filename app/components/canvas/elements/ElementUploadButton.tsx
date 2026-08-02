"use client";

import { useGenerationQueue } from "@/lib/generation/GenerationQueueProvider";
import { isGenerationActive } from "@/lib/generation/queue";
import { stillDependency } from "@/lib/connectors/animated_image/plugins/still-frame";
import { UploadImageButton } from "@/lib/upload/UploadImageButton";
import { useElementGeneration } from "./ElementGenerationContext";

export function ElementUploadButton() {
	const queue = useGenerationQueue();
	const { node, status } = useElementGeneration();
	// An upload replaces the still, leaving the animation stale to re-render.
	const target = stillDependency(node) ?? node;

	return (
		<UploadImageButton
			className="shrink-0"
			disabled={isGenerationActive(status)}
			onUpload={(url) =>
				queue.commitResult(target, { imageUrl: url, durationSec: 0 })
			}
		/>
	);
}
