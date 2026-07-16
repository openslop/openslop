import { memo } from "react";
import { ELEMENT_TYPES, type CanvasContentElement } from "@/lib/canvas/types";
import { useGenerate } from "../hooks/useGenerate";
import { getPrimaryUrl } from "@/lib/connectors/assetUrl";
import {
	AudioResult,
	AudioPlaceholder,
	MediaPreview,
	MediaPlaceholder,
} from "./preview/results";
import { AnimatedImagePreview } from "./preview/AnimatedImagePreview";

function OutputPreviewComponent({
	element,
}: {
	element: CanvasContentElement;
}) {
	const type = element.type;
	const { outputKind } = ELEMENT_TYPES[type];
	const { status, seconds, result, error, discard } = useGenerate(element);

	if (outputKind === "audio") {
		if (result?.audioUrl) {
			return (
				<AudioResult src={result.audioUrl} status={status} seconds={seconds} />
			);
		}
		return (
			<AudioPlaceholder
				status={status}
				seconds={seconds}
				error={error}
				onDiscard={discard}
			/>
		);
	}

	if (type === "animated_image") {
		return (
			<AnimatedImagePreview
				imageUrl={result?.imageUrl}
				videoUrl={result?.videoUrl}
				status={status}
				seconds={seconds}
				error={error}
				onDiscard={discard}
			/>
		);
	}

	const url = getPrimaryUrl(result, outputKind);
	if (url) {
		return (
			<MediaPreview
				key={url}
				url={url}
				outputKind={outputKind}
				status={status}
				seconds={seconds}
			/>
		);
	}

	return (
		<MediaPlaceholder
			status={status}
			seconds={seconds}
			error={error}
			onDiscard={discard}
		/>
	);
}

export const OutputPreview = memo(OutputPreviewComponent);
