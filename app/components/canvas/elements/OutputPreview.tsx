import { memo } from "react";
import type { CanvasContentElement } from "@/lib/canvas/types";
import { ELEMENT_PREVIEWS } from "./preview/registry";
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
		/>
	);
}

export const OutputPreview = memo(OutputPreviewComponent);
