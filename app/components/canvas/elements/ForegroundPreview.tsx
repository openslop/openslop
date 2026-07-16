import { ELEMENT_TYPES, type CanvasContentElement } from "@/lib/canvas/types";
import { useGenerate } from "../hooks/useGenerate";
import { PlaceholderBallsLoader } from "./preview/placeholderBalls";
import { MediaWithSkeleton } from "./MediaWithSkeleton";
import { getPrimaryUrl } from "@/lib/connectors/assetUrl";

export function ForegroundPreview({
	element,
}: {
	element: CanvasContentElement;
}) {
	const { result, status } = useGenerate(element);
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
