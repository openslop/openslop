import type { CanvasContentElement } from "../types";
import { ELEMENT_CONFIGS } from "../config/elementConfigs";
import { useGenerate } from "../hooks/useGenerate";
import {
	PlaceholderBalls,
	useStaticRotations,
	StaleIndicator,
} from "./OutputPreview";
import { MediaWithSkeleton } from "./MediaWithSkeleton";
import loaderStyles from "./OutputPreview.module.css";

export function ForegroundPreview({
	element,
}: {
	element: CanvasContentElement;
}) {
	const { result, generating, stale, generate } = useGenerate(element);
	const { outputKind } = ELEMENT_CONFIGS[element.type];
	const staticRotations = useStaticRotations();

	if (!result) {
		return (
			<div
				className={`relative w-full h-full rounded-lg overflow-hidden border bg-white/[0.03]`}
			>
				<div className={loaderStyles.containerLoader} aria-hidden="true">
					<PlaceholderBalls
						generating={generating}
						staticRotations={staticRotations}
					/>
				</div>
			</div>
		);
	}

	return (
		<div className={`relative w-full h-full rounded-lg overflow-hidden border`}>
			<MediaWithSkeleton
				outputKind={outputKind}
				src={result.url}
				alt="Scene preview"
			/>
			{stale && <StaleIndicator onClick={generate} />}
		</div>
	);
}
