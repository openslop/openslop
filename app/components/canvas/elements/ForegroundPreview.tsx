import type { CanvasContentElement } from "../types";
import { ELEMENT_CONFIGS } from "../config/elementConfigs";
import { useGenerate } from "../hooks/useGenerate";
import { PlaceholderBallsLoader } from "./preview/placeholderBalls";
import { StaleIndicator } from "./preview/overlays";
import { MediaWithSkeleton } from "./MediaWithSkeleton";
import { getPrimaryUrl } from "@/lib/connectors/assetUrl";

export function ForegroundPreview({
	element,
}: {
	element: CanvasContentElement;
}) {
	const { result, status, stale, generate } = useGenerate(element);
	const { outputKind } = ELEMENT_CONFIGS[element.type];
	const url = getPrimaryUrl(result, outputKind);

	if (!url) {
		return (
			<div className="relative w-full h-full rounded-lg overflow-hidden border bg-white/[0.03]">
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
			{stale && <StaleIndicator onClick={generate} />}
		</div>
	);
}
