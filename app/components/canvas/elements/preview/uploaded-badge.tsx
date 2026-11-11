"use client";

import { Badge } from "@/components/ui/badge";
import { Upload } from "@/components/ui/icon";
import { SimpleTooltip } from "@/components/ui/tooltip";
import { useElementGeneration } from "../element-generation-context";

/** Marks media the user supplied rather than generated, saying what that means here. */
export function UploadedLabel({ tooltip }: { tooltip: string }) {
	return (
		<SimpleTooltip label={tooltip}>
			<Badge variant="onMedia">
				<Upload className="h-3 w-3" />
				<span className="sr-only">{tooltip}</span>
			</Badge>
		</SimpleTooltip>
	);
}

export function UploadedBadge() {
	const { uploaded } = useElementGeneration();
	if (!uploaded) return null;
	return <UploadedLabel tooltip="Uploaded, so it is never regenerated" />;
}
