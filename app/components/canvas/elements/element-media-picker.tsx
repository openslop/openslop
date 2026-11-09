"use client";

import { useGenerationQueue } from "@/lib/generation/generation-queue-provider";
import { isGenerationActive } from "@/lib/generation/snapshots";
import type { UploadKind } from "@/lib/upload/upload-files";
import { commitUploaded } from "@/lib/upload/uploaded-result";
import { cn } from "@/lib/utils";
import { useElementGeneration } from "./element-generation-context";
import { MediaPicker } from "./media-picker";

/** Supplies the media an element would otherwise generate. */
function ElementMediaPicker({
	kind,
	className,
}: {
	kind: UploadKind;
	className?: string;
}) {
	const queue = useGenerationQueue();
	const { node, status } = useElementGeneration();
	return (
		<MediaPicker
			kind={kind}
			onPick={(url) => commitUploaded(queue, node, kind, url)}
			disabled={isGenerationActive(status)}
			className={cn("shrink-0", className)}
		/>
	);
}

export const AddImageButton = ({ className }: { className?: string }) => (
	<ElementMediaPicker kind="image" className={className} />
);

export const AddVideoButton = ({ className }: { className?: string }) => (
	<ElementMediaPicker kind="video" className={className} />
);

export const AddAudioButton = ({ className }: { className?: string }) => (
	<ElementMediaPicker kind="audio" className={className} />
);
