"use client";

import { useGenerationQueue } from "@/lib/generation/generation-queue-provider";
import { isGenerationActive } from "@/lib/generation/snapshots";
import { UploadImageButton } from "@/lib/upload/upload-image-button";
import { cn } from "@/lib/utils";
import { useElementGeneration } from "./element-generation-context";

/** Supplies the picture an element would otherwise generate. */
export function ElementUploadButton({ className }: { className?: string }) {
	const queue = useGenerationQueue();
	const { node, status } = useElementGeneration();

	return (
		<UploadImageButton
			className={cn("shrink-0", className)}
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
