import { memo } from "react";
import type { ResultKind } from "@/lib/canvas/types";
import { PREVIEWS_BY_KIND } from "./preview/registry";
import { UploadedBadge } from "./preview/uploaded-badge";
import { useElementGeneration } from "./element-generation-context";

function OutputPreviewComponent({ outputKind }: { outputKind: ResultKind }) {
	const { status, startedAt, result, error, discard } = useElementGeneration();
	const Preview = PREVIEWS_BY_KIND[outputKind];

	return (
		<Preview
			status={status}
			startedAt={startedAt}
			result={result}
			error={error}
			onDiscard={discard}
			topRight={<UploadedBadge />}
		/>
	);
}

export const OutputPreview = memo(OutputPreviewComponent);
