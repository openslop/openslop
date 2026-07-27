"use client";

import { useGenerationQueue } from "@/lib/generation/GenerationQueueProvider";
import { isGenerationActive } from "@/lib/generation/queue";
import { UploadImageButton } from "@/lib/upload/UploadImageButton";
import { ELEMENT_CONFIGS } from "@/lib/canvas/elementConfigs";
import type { CanvasContentElement } from "@/lib/canvas/types";
import { useElementGeneration } from "./ElementGenerationContext";

export function ElementUploadButton({
	element,
}: {
	element: CanvasContentElement;
}) {
	const queue = useGenerationQueue();
	const { status, inputs } = useElementGeneration();

	return (
		<UploadImageButton
			className="shrink-0"
			disabled={isGenerationActive(status)}
			onUpload={(url) => {
				// Kill any in-flight generation so a late result can't clobber the upload.
				queue.cancel(element.id);
				queue.commitResult(
					element.id,
					{ imageUrl: url, durationSec: 0 },
					inputs,
					ELEMENT_CONFIGS[element.type].connector,
				);
			}}
		/>
	);
}
