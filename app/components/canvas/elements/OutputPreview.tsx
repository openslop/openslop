import { memo } from "react";
import { ELEMENT_TYPES, type CanvasContentElement } from "@/lib/canvas/types";
import { getPrimaryUrl } from "@/lib/connectors/assetUrl";
import { AudioResult, AudioPlaceholder, MediaResult } from "./preview/results";
import { AnimatedImageOutput } from "./preview/AnimatedImagePreview";
import { useElementGeneration } from "./ElementGenerationContext";

function OutputPreviewComponent({
	element,
}: {
	element: CanvasContentElement;
}) {
	const type = element.type;
	const { outputKind } = ELEMENT_TYPES[type];
	const { status, seconds, result, error, discard } = useElementGeneration();
	const state = { status, seconds, error, onDiscard: discard };

	if (outputKind === "audio") {
		if (result?.audioUrl) {
			return (
				<AudioResult src={result.audioUrl} status={status} seconds={seconds} />
			);
		}
		return <AudioPlaceholder {...state} />;
	}

	if (type === "animated_image") {
		return <AnimatedImageOutput {...state} />;
	}

	return (
		<MediaResult
			{...state}
			url={getPrimaryUrl(result, outputKind)}
			outputKind={outputKind}
		/>
	);
}

export const OutputPreview = memo(OutputPreviewComponent);
