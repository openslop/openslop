"use client";

import { useGenerationQueue } from "@/lib/generation/generation-queue-provider";
import { isGenerationActive } from "@/lib/generation/snapshots";
import { UploadButton } from "@/lib/upload/upload-button";
import type { UploadKind } from "@/lib/upload/upload-files";
import { uploadedResult } from "@/lib/upload/uploaded-result";
import { cn } from "@/lib/utils";
import { useElementGeneration } from "./element-generation-context";

/** Supplies the media an element would otherwise generate. */
function ElementUploadButton({
	kind,
	className,
}: {
	kind: UploadKind;
	className?: string;
}) {
	const queue = useGenerationQueue();
	const { node, status } = useElementGeneration();

	return (
		<UploadButton
			kind={kind}
			className={cn("shrink-0", className)}
			disabled={isGenerationActive(status)}
			onUpload={async (url) =>
				queue.commitResult(node, await uploadedResult(kind, url), {
					pinned: true,
				})
			}
		/>
	);
}

export const ImageUploadButton = ({ className }: { className?: string }) => (
	<ElementUploadButton kind="image" className={className} />
);

export const VideoUploadButton = ({ className }: { className?: string }) => (
	<ElementUploadButton kind="video" className={className} />
);

export const AudioUploadButton = ({ className }: { className?: string }) => (
	<ElementUploadButton kind="audio" className={className} />
);
