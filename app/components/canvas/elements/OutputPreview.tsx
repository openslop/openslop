import { memo } from "react";
import type { ResultKind } from "@/lib/canvas/types";
import { PREVIEWS_BY_KIND } from "./preview/registry";
import { UploadedBadge } from "./preview/UploadedBadge";
import { useElementGeneration } from "./ElementGenerationContext";

function OutputPreviewComponent({ outputKind }: { outputKind: ResultKind }) {
	const { status, seconds, result, error, discard } = useElementGeneration();
	const Preview = PREVIEWS_BY_KIND[outputKind];

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
