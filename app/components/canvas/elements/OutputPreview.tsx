import { memo } from "react";
import type { CanvasContentElement } from "@/lib/canvas/types";
import { ELEMENT_CONFIGS } from "../config/elementConfigs";
import { useGenerate } from "../hooks/useGenerate";
import { BORDER_COLORS } from "./preview/status";
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
	const { outputKind } = ELEMENT_CONFIGS[type];
	const { status, seconds, result, error, stale, generate, discard } =
		useGenerate(element);

	if (outputKind === "audio") {
		if (result?.audioUrl) {
			return (
				<AudioResult
					type={type}
					src={result.audioUrl}
					characterName={element.customAttributes?.name}
					status={status}
					seconds={seconds}
					stale={stale}
					onRegenerate={generate}
				/>
			);
		}
		return (
			<AudioPlaceholder
				status={status}
				seconds={seconds}
				error={error}
				onGenerate={generate}
				onDiscard={discard}
			/>
		);
	}

	const borderColor = BORDER_COLORS[type] ?? "border-white/20";

	if (type === "animated_image") {
		return (
			<AnimatedImagePreview
				elementId={element.id}
				imageUrl={result?.imageUrl}
				videoUrl={result?.videoUrl}
				borderColor={borderColor}
				status={status}
				seconds={seconds}
				stale={stale}
				error={error}
				onRegenerate={generate}
				onGenerate={generate}
				onDiscard={discard}
			/>
		);
	}

	const url = getPrimaryUrl(result, outputKind);
	if (url) {
		return (
			<MediaPreview
				key={url}
				elementId={element.id}
				url={url}
				outputKind={outputKind}
				borderColor={borderColor}
				status={status}
				seconds={seconds}
				stale={stale}
				onRegenerate={generate}
			/>
		);
	}

	return (
		<MediaPlaceholder
			status={status}
			seconds={seconds}
			error={error}
			onGenerate={generate}
			onDiscard={discard}
		/>
	);
}

export const OutputPreview = memo(OutputPreviewComponent);
