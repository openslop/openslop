import type { CanvasContentElement } from "../types";
import { ELEMENT_CONFIGS } from "../config/elementConfigs";
import { useGenerate } from "../hooks/useGenerate";
import { PlaceholderBallsLoader } from "./preview/placeholderBalls";
import { StaleIndicator } from "./preview/overlays";
import { MediaWithSkeleton } from "./MediaWithSkeleton";

export function ForegroundPreview({
	element,
}: {
	element: CanvasContentElement;
}) {
	const { result, generating, stale, generate } = useGenerate(element);
	const { outputKind } = ELEMENT_CONFIGS[element.type];

	if (!result) {
		return (
			<div className="relative w-full h-full rounded-lg overflow-hidden border bg-white/[0.03]">
				<PlaceholderBallsLoader generating={generating} />
			</div>
		);
	}

	return (
		<div className="relative w-full h-full rounded-lg overflow-hidden border">
			<MediaWithSkeleton
				outputKind={outputKind}
				src={result.url}
				alt="Scene preview"
			/>
			{stale && <StaleIndicator onClick={generate} />}
		</div>
	);
}
