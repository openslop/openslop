"use client";

import { useConfig } from "@/lib/config/ConfigProvider";
import {
	useGenerationQueue,
	useQueueSelector,
} from "@/lib/generation/GenerationQueueProvider";
import { getGenerationInputs } from "@/lib/generation/getGenerationInputs";
import { useProjectStore } from "@/lib/project/store";
import { UploadImageButton } from "@/lib/upload/UploadImageButton";
import type { CanvasContentElement } from "@/lib/canvas/types";

export function ElementUploadButton({
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
	const busy = status === "generating" || status === "queued";

	return (
		<UploadImageButton
			className="shrink-0"
			disabled={busy}
			onUpload={(url) => {
				// Kill any in-flight generation so a late result can't clobber the upload.
				queue.cancel(element.id);
				queue.commitResult(
					element.id,
					{ imageUrl: url, durationSec: 0 },
					getGenerationInputs(element, metadata),
				);
			}}
		/>
	);
}
