import { memo } from "react";
import type { CanvasContentElement } from "@/lib/canvas/types";
import { ELEMENT_PREVIEWS } from "./preview/registry";
import { UploadedBadge } from "./preview/UploadedBadge";
import { useElementGeneration } from "./ElementGenerationContext";

function OutputPreviewComponent({
	element,
}: {
	element: CanvasContentElement;
}) {
	const { status, seconds, result, error, discard } = useElementGeneration();
	const Preview = ELEMENT_PREVIEWS[element.type];

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
