import { memo } from "react";
import type { CanvasContentElement } from "../types";
import { ELEMENT_CONFIGS } from "../config/elementConfigs";
import { useGenerate } from "../hooks/useGenerate";
import { deriveStatus, BORDER_COLORS } from "./preview/status";
import {
	AudioResult,
	AudioPlaceholder,
	MediaPreview,
	MediaPlaceholder,
} from "./preview/results";

function OutputPreviewComponent({
	element,
}: {
	element: CanvasContentElement;
}) {
	const type = element.type;
	const { outputKind } = ELEMENT_CONFIGS[type];
	const {
		generating,
		queued,
		seconds,
		result,
		error,
		stale,
		generate,
		discard,
	} = useGenerate(element);
	const status = deriveStatus(generating, queued);

	if (outputKind === "audio") {
		if (result) {
			return (
				<AudioResult
					type={type}
					src={result.url}
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

	if (result) {
		return (
			<MediaPreview
				key={result.url}
				url={result.url}
				outputKind={outputKind}
				borderColor={BORDER_COLORS[type] ?? "border-white/20"}
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
