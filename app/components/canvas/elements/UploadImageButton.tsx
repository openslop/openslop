"use client";

import { ImagePlus } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { useConfig } from "@/lib/config/ConfigProvider";
import {
	useGenerationQueue,
	useQueueSelector,
} from "@/lib/generation/GenerationQueueProvider";
import { getGenerationInputs } from "@/lib/generation/getGenerationInputs";
import { useProjectStore } from "@/lib/project/store";
import { useImageUpload } from "@/lib/upload/useImageUpload";
import type { CanvasContentElement } from "@/lib/canvas/types";

export function UploadImageButton({
	element,
}: {
	element: CanvasContentElement;
}) {
	const { projectId } = useConfig();
	const queue = useGenerationQueue();
	const status = useQueueSelector(
		(q) => q.getElementSnapshot(element.id).status,
	);
	const metadata = useProjectStore(projectId, (s) => s.metadata);

	const { openPicker, uploading, inputElement } = useImageUpload({
		onUpload: ([url]) => {
			if (!url) return;
			const inputs = getGenerationInputs(element, metadata);
			queue.setManualResult(
				element.id,
				{ imageUrl: url, durationSec: 0 },
				inputs,
			);
		},
	});

	if (element.type !== "image") return null;

	const busy = status === "generating" || status === "queued";

	return (
		<>
			{inputElement}
			<Button
				type="button"
				variant="ghost"
				size="sm"
				tooltip="Upload your own image"
				className="shrink-0"
				disabled={uploading || busy}
				onMouseDown={(e) => e.preventDefault()}
				onClick={openPicker}
			>
				<ImagePlus aria-hidden="true" />
				<span className="hidden sm:inline">
					{uploading ? "Uploading…" : "Upload"}
				</span>
			</Button>
		</>
	);
}
