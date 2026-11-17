import { memo } from "react";
import type { ResultKind } from "@/lib/canvas/types";
import { PREVIEWS_BY_KIND } from "./preview/registry";
import { UploadedBadge } from "./preview/uploaded-badge";
import { GenerationCost } from "./generation-cost";
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
			topRight={
				<>
					<UploadedBadge />
					<GenerationCost costUsd={result?.costUsd} size="xs" />
				</>
			}
		/>
	);
}

export const OutputPreview = memo(OutputPreviewComponent);
