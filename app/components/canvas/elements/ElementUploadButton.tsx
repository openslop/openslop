"use client";

import { useGenerationQueue } from "@/lib/generation/GenerationQueueProvider";
import { isGenerationActive } from "@/lib/generation/snapshots";
import { pictureNode } from "@/lib/connectors/animated_image/plugins/still-frame";
import { UploadImageButton } from "@/lib/upload/UploadImageButton";
import { useElementGeneration } from "./ElementGenerationContext";

/** Supplies the picture an element would otherwise generate, so only the elements that make one offer it. */
export function ElementUploadButton() {
	const queue = useGenerationQueue();
	const { node, status } = useElementGeneration();
	const target = pictureNode(node);
	if (!target) return null;

	return (
		<UploadImageButton
			className="shrink-0"
			disabled={isGenerationActive(status)}
			onUpload={(url) =>
				queue.commitResult(
					target,
					{ imageUrl: url, durationSec: 0 },
					{ pinned: true },
				)
			}
		/>
	);
}
