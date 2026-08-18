import { useQueueSelector } from "@/lib/generation/GenerationQueueProvider";
import { ELEMENT_TYPES, type CanvasContentElement } from "@/lib/canvas/types";
import { PlaceholderBallsLoader } from "./preview/placeholderBalls";
import { MediaWithSkeleton } from "./MediaWithSkeleton";
import { getPrimaryUrl } from "@/lib/connectors/assetUrl";

// Mounted once per scene by both the storyboard and the collapsed canvas, and
// read-only: it takes the element's snapshot straight off the queue rather than
// `useGenerate`, whose node graph and restore effect belong to the element card.
export function ForegroundPreview({
	element,
}: {
	element: CanvasContentElement;
}) {
	const { result, status } = useQueueSelector((queue) =>
		queue.getElementSnapshot(element.id),
	);
	const { outputKind } = ELEMENT_TYPES[element.type];
	const url = getPrimaryUrl(result, outputKind);

	if (!url) {
		return (
			<div className="relative w-full h-full rounded-lg overflow-hidden border bg-muted">
				<PlaceholderBallsLoader generating={status === "generating"} />
			</div>
		);
	}

	return (
		<div className="relative w-full h-full rounded-lg overflow-hidden border">
			<MediaWithSkeleton
				outputKind={outputKind}
				src={url}
				alt="Scene preview"
			/>
		</div>
	);
}
