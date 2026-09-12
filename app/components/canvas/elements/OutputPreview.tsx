import { memo } from "react";
import { ELEMENT_TYPES, type CanvasContentElement } from "@/lib/canvas/types";
import { PREVIEWS_BY_KIND } from "./preview/registry";
import { UploadedBadge } from "./preview/UploadedBadge";
import { useElementGeneration } from "./ElementGenerationContext";

function OutputPreviewComponent({
	element,
}: {
	element: CanvasContentElement;
}) {
	const { status, seconds, result, error, discard } = useElementGeneration();
	const Preview = PREVIEWS_BY_KIND[ELEMENT_TYPES[element.type].outputKind];

	return (
		<Preview
			status={status}
			seconds={seconds}
			result={result}
			error={error}
			onDiscard={discard}
			topRight={<UploadedBadge />}
		/>
	);
}

export const OutputPreview = memo(OutputPreviewComponent);
